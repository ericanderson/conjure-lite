import type * as ConjureIr from "conjure-api";
import * as fs from "node:fs";
import * as path from "node:path";
import invariant from "tiny-invariant";
import * as yaml from "yaml";
import type { AliasDefinition } from "../schemas/conjure-plus/AliasDefinition.js";
import type { ConjureSourceFile } from "../schemas/conjure-plus/ConjureSourceFile.js";
import { ConjureSourceFileSchema } from "../schemas/conjure-plus/ConjureSourceFile.js";
import type { ConjureType } from "../schemas/conjure-plus/ConjureType.js";
import type { EndpointDefinition } from "../schemas/conjure-plus/EndpointDefinition.js";
import type { EnumTypeDefinition } from "../schemas/conjure-plus/EnumTypeDefinition.js";
import type { FieldDefinition } from "../schemas/conjure-plus/FieldDefinition.js";
import type { NamedTypesDefinition } from "../schemas/conjure-plus/NamedTypesDefinition.js";
import type { ObjectTypeDefinition } from "../schemas/conjure-plus/ObjectTypeDefinition.js";
import type { ServiceDefinition } from "../schemas/conjure-plus/ServiceDefinition.js";
import type { UnionTypeDefinition } from "../schemas/conjure-plus/UnionTypeDefinition.js";
import type { ArgumentDefinition } from "../schemas/conjure/ArgumentDefinition.js";
import type { ExternalTypeDefinition } from "../schemas/conjure/ExternalTypeDefinition.js";
import type { LogSafety } from "../schemas/conjure/LogSafety.js";

interface QualifiedTypeName {
  package: string;
  name: string;
  sourceFile: string; // which file defined this type
}

interface FileCtx {
  filePath: string; // absolute path to this file
  cjs: ConjureSourceFile;
  defaultPackage: string | undefined;

  // Import resolution
  conjureImports: Record<string, string>; // namespace -> absolute file path
  importedTypes: Map<string, QualifiedTypeName>; // local name -> fully qualified

  /*
   * Map of type name to external type definition from `imports`.
   * Used to resolve external types during type conversion.
   */
  imports: Record<string, ExternalTypeDefinition>; // type name -> external def
  xtags: {
    types: {
      [typeName: string]: {
        object?: Record<string, string>;
        fields?: { [fieldName: string]: Record<string, string> };
      };
    };
    errors: {
      [errorName: string]: Record<string, string>;
    };
  };
}

interface Ctx {
  // Global context for all files
  fileContexts: Map<string, FileCtx>; // absolute path -> FileCtx
  processedFiles: Set<string>; // prevent circular imports
  rootFilePath: string; // entry point file
  typeRegistry: Map<string, QualifiedTypeName>; // fully qualified name -> type info
}

/**
 * Load and process a Conjure YAML file with full import resolution
 */
export function conjureYamlToIrFromFile(
  filePath: string,
): ConjureIr.IConjureDefinition {
  const absolutePath = path.resolve(filePath);

  const globalCtx: Ctx = {
    fileContexts: new Map(),
    processedFiles: new Set(),
    rootFilePath: absolutePath,
    typeRegistry: new Map(),
  };

  // Phase 1: Load all files and build contexts
  loadConjureFile(absolutePath, globalCtx);

  // Phase 2: Build type registry
  buildTypeRegistry(globalCtx);

  // Phase 3: Convert to IR using the root file
  const rootFileCtx = globalCtx.fileContexts.get(absolutePath)!;
  return convertFileToIr(rootFileCtx, globalCtx);
}

/**
 * Find the namespace for an error by looking up its definition
 */
function findErrorNamespace(errorName: string, ctx: FileCtx): string {
  // Look for the error in the current definitions
  const errorDef = ctx.cjs.types?.definitions?.errors?.[errorName];
  if (errorDef) {
    // Return the namespace as-is since conjure-imports are file references, not namespace aliases
    return errorDef.namespace;
  }

  // If not found, return a default namespace
  // This could happen if the error is defined in an imported package
  // FIXME
  return "Unknown";
}

const listRegex = /^list<(.+)>$/;
const mapRegex = /^map<(.+),\s*(.+)>$/;
function convertDefinitions(definitions: NamedTypesDefinition | undefined, ctx: FileCtx) {
  const types: ConjureIr.ITypeDefinition[] = [];

  // const defaultPackage = definitions?.["default-package"];
  if (definitions?.objects) {
    for (const [objectName, objInfo] of Object.entries(definitions.objects)) {
      if ("fields" in objInfo) {
        types.push(convertObject(objectName, objInfo, ctx));
      } else if ("alias" in objInfo) {
        types.push(convertAlias(objectName, objInfo, ctx));
      } else if ("union" in objInfo) {
        types.push(convertUnion(objectName, objInfo, ctx));
      } else {
        invariant("enum" in objInfo, `Unknown object type: ${objectName}`);
        types.push(convertEnum(objectName, objInfo, ctx));
      }
    }
  }

  const errors: ConjureIr.IErrorDefinition[] = [];
  if (definitions?.errors) {
    for (const [errorName, errorInfo] of Object.entries(definitions.errors)) {
      errors.push({
        errorName: convertTypeName(undefined, ctx, errorName),
        code: errorInfo.code,
        namespace: errorInfo.namespace,
        safeArgs: Object.entries(errorInfo["safe-args"] ?? {})
          .map(([argName, arg]) => convertField(argName, arg, ctx)),
        unsafeArgs: Object.entries(errorInfo["unsafe-args"] ?? {})
          .map(([argName, arg]) => convertField(argName, arg, ctx)),
        docs: errorInfo.docs,
      });
    }
  }

  return { types, errors };
}

function convertUnion(
  typeName: string,
  typeInfo: UnionTypeDefinition,
  ctx: FileCtx,
): ConjureIr.ITypeDefinition {
  const union = Object.entries(typeInfo.union).map(([name, value]) =>
    convertField(name, value, ctx)
  );
  if (typeInfo["x-tags"]) {
    ctx.xtags.types[typeName].object = typeInfo["x-tags"];
  }
  return {
    type: "union",
    union: {
      typeName: convertTypeName(typeInfo.package, ctx, typeName),
      union,
    },
  };
}

function convertEnum(
  typeName: string,
  typeInfo: EnumTypeDefinition,
  ctx: FileCtx,
): ConjureIr.ITypeDefinition {
  const values = typeInfo.values.map<ConjureIr.IEnumValueDefinition>((value) => {
    if (typeof value === "string") return { value };
    return value;
  });

  if (typeInfo["x-tags"]) {
    ctx.xtags.types[typeName].object = typeInfo["x-tags"];
  }

  return {
    type: "enum",
    enum: {
      typeName: convertTypeName(typeInfo.package, ctx, typeName),
      values,
      ...(typeInfo.docs ? { docs: typeInfo.docs } : {}),
    },
  };
}

function convertAlias(
  typeName: string,
  typeInfo: AliasDefinition,
  ctx: FileCtx,
): ConjureIr.ITypeDefinition {
  if (typeInfo["x-tags"]) {
    ctx.xtags.types[typeName].object = typeInfo["x-tags"];
  }

  return {
    type: "alias",
    alias: {
      typeName: convertTypeName(typeInfo.package, ctx, typeName),
      alias: convertType(typeInfo.alias, ctx),
      ...(typeInfo.docs ? { docs: typeInfo.docs } : {}),
      safety: convertLogSafety(typeInfo.safety),
    },
  };
}

function convertType(
  type: ConjureType,
  ctx: FileCtx,
): ConjureIr.IType {
  if (isPrimitiveType(type)) {
    return {
      type: "primitive",
      primitive: asPrimitiveType(type),
    };
  }

  const listMatch = listRegex.exec(type);
  if (listMatch) {
    return {
      type: "list",
      list: {
        itemType: convertType(listMatch[1], ctx),
      },
    };
  }

  const mapMatch = mapRegex.exec(type);
  if (mapMatch) {
    return {
      type: "map",
      map: {
        keyType: convertType(mapMatch[1], ctx),
        valueType: convertType(mapMatch[2], ctx),
      },
    };
  }

  // Check if this type is defined in imports (external types)
  const externalType = ctx.imports[type];
  if (externalType) {
    // For external types, we need to extract the package from the Java type
    // The Java type is typically in format "com.example.package.TypeName"
    const javaType = externalType.external.java;
    const lastDotIndex = javaType.lastIndexOf(".");

    if (lastDotIndex > 0) {
      const packageName = javaType.substring(0, lastDotIndex);
      const typeName = javaType.substring(lastDotIndex + 1);

      return {
        type: "external",
        external: {
          externalReference: {
            package: packageName,
            name: typeName,
          },
          fallback: convertType(externalType["base-type"], ctx),
        },
      };
    }

    // If we can't parse the Java type, fall back to using the base type
    return convertType(externalType["base-type"], ctx);
  }

  // Check if this is an imported type (namespace.TypeName)
  const importedType = ctx.importedTypes.get(type);
  if (importedType) {
    return {
      type: "reference",
      reference: {
        package: importedType.package,
        name: importedType.name,
      },
    };
  }

  // Default case: create a reference to a type in the current package
  return {
    type: "reference",
    reference: {
      package: ctx.defaultPackage ?? "default",
      name: type,
    },
  };
}

interface ObjectCtx extends FileCtx {
  typeName: string;
}

function convertObject(
  typeName: string,
  typeInfo: ObjectTypeDefinition,
  ctx: FileCtx,
): ConjureIr.ITypeDefinition {
  const objectCtx: ObjectCtx = {
    ...ctx,
    typeName,
  };
  const fields: ConjureIr.IFieldDefinition[] = [];
  for (const [fieldName, fieldInfo] of Object.entries(typeInfo.fields)) {
    fields.push(convertObjectField(fieldName, fieldInfo, objectCtx));
  }

  if (typeInfo["x-tags"]) {
    ctx.xtags.types[typeName].object = typeInfo["x-tags"];
  }

  return {
    type: "object",
    object: {
      typeName: convertTypeName(typeInfo.package, ctx, typeName),
      fields,
      ...(typeInfo.docs ? { docs: typeInfo.docs } : {}),
    },
  };
}

function convertTypeName(
  packageName: string | undefined,
  ctx: FileCtx,
  typeName: string,
): ConjureIr.ITypeName {
  return {
    package: packageName ?? ctx.defaultPackage ?? "default",
    name: typeName,
  };
}

function convertObjectField(
  fieldName: string,
  fieldInfo: ConjureType | FieldDefinition,
  ctx: ObjectCtx,
): ConjureIr.IFieldDefinition {
  if (typeof fieldInfo === "object" && fieldInfo["x-tags"]) {
    ctx.xtags.types[ctx.typeName] ??= {};
    ctx.xtags.types[ctx.typeName].fields ??= {};
    ctx.xtags.types[ctx.typeName].fields![fieldName] = fieldInfo["x-tags"];
  }
  return convertField(fieldName, fieldInfo, ctx);
}

function convertField(
  fieldName: string,
  fieldInfo: ConjureType | FieldDefinition,
  ctx: FileCtx,
): ConjureIr.IFieldDefinition {
  if (typeof fieldInfo === "string") {
    return {
      fieldName,
      type: convertType(fieldInfo, ctx),
    };
  }

  return {
    fieldName,
    type: convertType(fieldInfo.type, ctx),
    ...(fieldInfo.docs ? { docs: fieldInfo.docs } : {}),
    ...(fieldInfo.deprecated ? { deprecated: fieldInfo.deprecated } : {}),
    ...(fieldInfo.safety ? { safety: convertLogSafety(fieldInfo.safety) } : {}),
  };
}

function convertLogSafety(value: LogSafety | undefined): ConjureIr.LogSafety | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === "do-not-log") {
    return "DO_NOT_LOG";
  }
  if (value === "safe") {
    return "SAFE";
  }
  if (value === "unsafe") {
    return "UNSAFE";
  }
  throw new Error(`Unknown LogSafety value: ${value as string}`);
}

function isPrimitiveType(
  type: ConjureType,
): type is ConjureIr.PrimitiveType {
  switch (type.toUpperCase()) {
    case "STRING":
    case "DATETIME":
    case "INTEGER":
    case "DOUBLE":
    case "SAFELONG":
    case "BINARY":
    case "ANY":
    case "BOOLEAN":
    case "UUID":
    case "RID":
    case "BEARERTOKEN":
      return true;
    default:
      return false;
  }
}

function asPrimitiveType(
  type: ConjureType,
): ConjureIr.PrimitiveType {
  invariant(isPrimitiveType(type), `Expected primitive type, got: ${type}`);
  return type.toUpperCase() as ConjureIr.PrimitiveType;
}

// regex to extract the argument names in a path.
// e.g. `/list/{airport}/{time}` would be converted to `airport` and `time`.
const pathArgRegex = /\{([a-zA-Z0-9_]+)\}/g;

function convertEndpointArgument(
  argName: string,
  argInfo: ConjureType | ArgumentDefinition,
  pathArgs: Set<string>,
  ctx: FileCtx,
): ConjureIr.IArgumentDefinition {
  if (typeof argInfo === "string") {
    return {
      argName,
      markers: [],
      tags: [],
      type: convertType(argInfo, ctx),
      paramType: pathArgs.has(argName) ? { type: "path", path: {} } : { type: "body", body: {} },
    };
  }
  return {
    argName,
    type: convertType(argInfo.type, ctx),
    docs: argInfo.docs,
    markers: argInfo.markers?.map(m => convertType(m, ctx)) || [],
    tags: argInfo.tags || [],
    paramType: (argInfo["param-type"] === "auto" || argInfo["param-type"] == null)
      ? pathArgs.has(argName)
        ? { type: "path" as const, path: {} }
        : { type: "body" as const, body: {} }
      : {
        type: argInfo["param-type"],
        [argInfo["param-type"]]: {},
      } as unknown as ConjureIr.IParameterType,
    safety: convertLogSafety(argInfo.safety),
  };
}

// Regex to match HTTP methods in the format "GET /path", "POST /path", etc.
// e.g. GET /list/{airport}/{time}
// POST /search
const httpMethodRegex = /^(GET|DELETE|POST|PUT)\s+(.+)$/;

// Regex to extract cookie names from the auth string.
// e.g. `cookie:{{name}}` would extract `name`.
const cookieNameRegex = /cookie:\{\{([a-zA-Z0-9_-]+)\}\}/;

function convertEndpoint(
  endpointName: string,
  endpointInfo: EndpointDefinition,
  basePath: string,
  defaultAuth: string,
  ctx: FileCtx,
): ConjureIr.IEndpointDefinition {
  const [, httpMethod, httpPath] = endpointInfo.http.match(httpMethodRegex) || [];
  invariant(
    httpMethod && httpPath,
    `Invalid HTTP format for endpoint ${endpointName}: ${endpointInfo.http}`,
  );

  const errors = endpointInfo.errors?.map<ConjureIr.IEndpointError>(error => ({
    error: {
      ...convertTypeName(undefined, ctx, error.error),
      namespace: findErrorNamespace(error.error, ctx),
    },
    docs: error.docs,
  })) ?? [];

  const authString = endpointInfo.auth ?? defaultAuth;

  const pathParamNames = new Set(httpPath.match(pathArgRegex)?.map(m => m[1]) || []);
  return {
    endpointName,
    httpMethod: httpMethod as "GET" | "DELETE" | "POST" | "PUT",
    httpPath: `${basePath}${httpPath}`,
    auth: authString == "none"
      ? undefined
      : authString === "header"
      ? { type: "header", header: {} }
      : { // endpointInfo.auth,
        type: "cookie",
        cookie: {
          cookieName: cookieNameRegex.exec(authString)![1],
        },
      },
    ...(endpointInfo.returns
      ? { returns: convertType(endpointInfo.returns, ctx) }
      : {}),
    args: Object.entries(endpointInfo.args || {}).map(([argName, argInfo]) =>
      convertEndpointArgument(
        argName,
        argInfo,
        pathParamNames,
        ctx,
      )
    ),
    markers: [],
    tags: endpointInfo.tags || [],

    // conjure lets this be undefined/missing
    errors,
    ...(endpointInfo.docs ? { docs: endpointInfo.docs } : {}),
    ...(endpointInfo.deprecated ? { deprecated: endpointInfo.deprecated } : {}),
  };
}

function convertService(
  serviceName: string,
  serviceInfo: ServiceDefinition,
  ctx: FileCtx,
): ConjureIr.IServiceDefinition {
  const basePath = serviceInfo["base-path"];
  const defaultAuth = serviceInfo["default-auth"];
  return {
    serviceName: convertTypeName(serviceInfo.package, ctx, serviceName),
    ...(serviceInfo.docs ? { docs: serviceInfo.docs } : {}),
    endpoints: Object.entries(serviceInfo.endpoints).map<ConjureIr.IEndpointDefinition>(
      ([endpointName, endpoint]) =>
        convertEndpoint(endpointName, endpoint, basePath, defaultAuth, ctx),
    ),
  };
}
function convertServices(
  services: Record<string, ServiceDefinition> | undefined,
  ctx: FileCtx,
): ConjureIr.IServiceDefinition[] {
  if (!services) return [];

  return Object.entries(services).map<ConjureIr.IServiceDefinition>(
    ([name, service]) => convertService(name, service, ctx),
  );
}

/**
 * Load a Conjure file and all its imports recursively
 */
function loadConjureFile(filePath: string, globalCtx: Ctx): FileCtx {
  // Check if already processed to prevent circular imports
  if (globalCtx.processedFiles.has(filePath)) {
    const existing = globalCtx.fileContexts.get(filePath);
    if (existing) {
      return existing;
    }
    throw new Error(`Circular import detected: ${filePath}`);
  }

  globalCtx.processedFiles.add(filePath);

  // Read and parse the YAML file
  const fileContents = fs.readFileSync(filePath, "utf8");
  const yamlDocument = yaml.parseDocument(fileContents, {});
  const cjs = ConjureSourceFileSchema.parse(yamlDocument.toJSON());

  // Create file context
  const fileCtx: FileCtx = {
    filePath,
    cjs,
    defaultPackage: cjs.types?.definitions?.["default-package"],
    conjureImports: {},
    importedTypes: new Map(),
    imports: {},
    xtags: {
      types: {},
      errors: {},
    },
  };

  // Store in global context
  globalCtx.fileContexts.set(filePath, fileCtx);

  // Process conjure-imports and load referenced files
  if (cjs.types?.["conjure-imports"]) {
    const baseDir = path.dirname(filePath);

    for (const [namespace, relativePath] of Object.entries(cjs.types["conjure-imports"])) {
      // Resolve relative path to absolute path
      let importPath = path.resolve(baseDir, relativePath);

      // Try different extensions if file doesn't exist
      if (!fs.existsSync(importPath)) {
        const extensions = [".yml", ".yaml"];
        let found = false;

        for (const ext of extensions) {
          const pathWithExt = importPath + ext;
          if (fs.existsSync(pathWithExt)) {
            importPath = pathWithExt;
            found = true;
            break;
          }
        }

        if (!found) {
          throw new Error(`Cannot find imported file: ${relativePath} (resolved to ${importPath})`);
        }
      }

      // Store the resolved absolute path
      fileCtx.conjureImports[namespace] = importPath;

      // Recursively load the imported file
      loadConjureFile(importPath, globalCtx);
    }
  }

  // Process external imports
  if (cjs.types?.imports) {
    fileCtx.imports = cjs.types.imports;
  }

  return fileCtx;
}

/**
 * Build a global type registry from all loaded files
 */
function buildTypeRegistry(globalCtx: Ctx): void {
  for (const [_filePath, fileCtx] of globalCtx.fileContexts) {
    const definitions = fileCtx.cjs.types?.definitions;
    if (!definitions?.objects) continue;

    for (const [typeName, typeInfo] of Object.entries(definitions.objects)) {
      const packageName = typeInfo.package ?? fileCtx.defaultPackage ?? "default";
      const fullyQualifiedName = `${packageName}.${typeName}`;

      const qualifiedType: QualifiedTypeName = {
        package: packageName,
        name: typeName,
        sourceFile: fileCtx.filePath,
      };

      globalCtx.typeRegistry.set(fullyQualifiedName, qualifiedType);
    }
  }

  // Build import mappings for each file
  for (const [_filePath, fileCtx] of globalCtx.fileContexts) {
    for (const [namespace, importedFilePath] of Object.entries(fileCtx.conjureImports)) {
      const importedFileCtx = globalCtx.fileContexts.get(importedFilePath);
      if (!importedFileCtx) continue;

      const importedDefinitions = importedFileCtx.cjs.types?.definitions;
      if (!importedDefinitions?.objects) continue;

      // Map namespace.TypeName to fully qualified type
      for (const [typeName, typeInfo] of Object.entries(importedDefinitions.objects)) {
        const packageName = typeInfo.package ?? importedFileCtx.defaultPackage ?? "default";
        const localName = `${namespace}.${typeName}`;

        const qualifiedType: QualifiedTypeName = {
          package: packageName,
          name: typeName,
          sourceFile: importedFilePath,
        };

        fileCtx.importedTypes.set(localName, qualifiedType);
      }
    }
  }
}

/**
 * Convert a file context to Conjure IR
 */
function convertFileToIr(_fileCtx: FileCtx, globalCtx: Ctx): ConjureIr.IConjureDefinition {
  // Collect all types from all files
  const allTypes: ConjureIr.ITypeDefinition[] = [];
  const allErrors: ConjureIr.IErrorDefinition[] = [];
  const allServices: ConjureIr.IServiceDefinition[] = [];

  // Merge x-tags from all files
  const mergedXTags = {
    types: {} as Record<string, any>,
    errors: {} as Record<string, any>,
  };

  for (const [, ctx] of globalCtx.fileContexts) {
    if (ctx.cjs.types?.definitions) {
      const { types, errors } = convertDefinitions(ctx.cjs.types.definitions, ctx);
      allTypes.push(...types);
      allErrors.push(...errors);
    }

    if (ctx.cjs.services) {
      const services = convertServices(ctx.cjs.services, ctx);
      allServices.push(...services);
    }

    // Merge x-tags
    Object.assign(mergedXTags.types, ctx.xtags.types);
    Object.assign(mergedXTags.errors, ctx.xtags.errors);
  }

  return {
    version: 1,
    types: allTypes,
    errors: allErrors,
    extensions: {
      "recommended-product-dependencies": [],
      "x-tags": mergedXTags,
    },
    services: allServices,
  };
}
