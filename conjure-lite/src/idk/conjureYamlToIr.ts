import type * as ConjureIr from "conjure-api";
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
import type { LogSafety } from "../schemas/conjure/LogSafety.js";

interface Ctx {
  cjs: ConjureSourceFile;
  defaultPackage: string | undefined;
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

export function conjureYamlToIr(
  fileContents: string,
): ConjureIr.IConjureDefinition {
  const yamlDocument = yaml.parseDocument(fileContents, {});
  const cjs = ConjureSourceFileSchema.parse(yamlDocument.toJSON());

  const ctx: Ctx = {
    cjs,
    defaultPackage: cjs.types?.definitions?.["default-package"],
    xtags: {
      types: {},
      errors: {},
    },
  };

  invariant(cjs.types, "Conjure source file must contain types");
  const { types, errors } = convertDefinitions(cjs.types.definitions, ctx);

  return {
    version: 1,
    types,
    errors,
    extensions: {
      "recommended-product-dependencies": [],
      "x-tags": ctx.xtags,
    },
    services: convertServices(cjs.services, ctx),
  };
}

const listRegex = /^list<(.+)>$/;
const mapRegex = /^map<(.+),\s*(.+)>$/;
function convertDefinitions(definitions: NamedTypesDefinition | undefined, ctx: Ctx) {
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
  ctx: Ctx,
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
  ctx: Ctx,
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
  ctx: Ctx,
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
  ctx: Ctx,
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

  return {
    type: "reference",
    reference: {
      package: ctx.defaultPackage!, // FIXME
      name: type,
    },
  };
}

interface ObjectCtx extends Ctx {
  typeName: string;
}

function convertObject(
  typeName: string,
  typeInfo: ObjectTypeDefinition,
  ctx: Ctx,
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
  ctx: Ctx,
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
  ctx: Ctx,
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
  ctx: Ctx,
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
  ctx: Ctx,
): ConjureIr.IEndpointDefinition {
  const [, httpMethod, httpPath] = endpointInfo.http.match(httpMethodRegex) || [];
  invariant(
    httpMethod && httpPath,
    `Invalid HTTP format for endpoint ${endpointName}: ${endpointInfo.http}`,
  );

  const errors = endpointInfo.errors?.map<ConjureIr.IEndpointError>(error => ({
    error: {
      ...convertTypeName(undefined, ctx, error.error),
      namespace: "FIXME",
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
  ctx: Ctx,
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
  ctx: Ctx,
): ConjureIr.IServiceDefinition[] {
  if (!services) return [];

  return Object.entries(services).map<ConjureIr.IServiceDefinition>(
    ([name, service]) => convertService(name, service, ctx),
  );
}
