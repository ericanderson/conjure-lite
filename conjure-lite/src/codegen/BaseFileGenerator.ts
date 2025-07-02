import type * as ConjureApi from "conjure-api";
import * as path from "node:path";
import { writeCodeFile } from "../util/writeCodeFile.js";
import type { CodeGen } from "./CodeGen.js";

export class BaseFileGenerator<
  D extends
    | ConjureApi.ITypeDefinition
    | (ConjureApi.IServiceDefinition & { typeName?: undefined })
    | (ConjureApi.IEndpointDefinition & { typeName?: undefined })
    | { packageName: string; typeName?: undefined },
> {
  public readonly defs: D[];
  public readonly filePath: string;
  public readonly codeGen: CodeGen;
  public readonly imports = new Map<string, string>();
  public readonly typeImports = new Map<string, Set<string>>();
  includeZod: boolean;

  constructor(
    filePath: string,
    codeGen: CodeGen,
    def: D | D[],
    includeZod: boolean,
  ) {
    this.filePath = filePath;
    this.codeGen = codeGen;
    this.defs = Array.isArray(def) ? def : [def];
    this.includeZod = includeZod;
  }

  ensureImportForType(
    type: ConjureApi.IType | ConjureApi.IServiceDefinition | ConjureApi.ITypeName,
  ): void {
    if ("package" in type) {
      if (this.codeGen.getFilePath(type) === this.filePath) {
        return;
      }
      const importPath = this.getImportModuleSpecifier(type);

      // This won't quite catch all conflicts but I am willing to bet its 99.9%
      const importSpecifier = `${type.name} as ${
        this.codeGen.getShortPackage(type.package).replaceAll(".", "_")
      }_${type.name}`;

      this.imports.set(
        `${type.package}.${type.name}`,
        `import ${this.includeZod ? "" : "type "}{ ${importSpecifier} } from "${importPath}";`,
      );
      return;
    }

    if ("serviceName" in type) {
      return this.ensureImportForType(type.serviceName);
    }

    switch (type.type) {
      case "list":
        this.ensureImportForType(type.list.itemType);
        return;

      case "primitive":
        return;

      case "reference": {
        return this.ensureImportForType(type.reference);
      }

      case "optional":
        this.ensureImportForType(type.optional.itemType);
        return;
    }

    return;
  }

  getImportModuleSpecifier(targetFile: string): string;
  getImportModuleSpecifier(type: ConjureApi.ITypeName): string;
  getImportModuleSpecifier(type: ConjureApi.ITypeName | string) {
    let importPath = path.relative(
      path.dirname(this.filePath),
      this.codeGen.getFilePathForImport(type),
    );

    if (!importPath.startsWith(".")) importPath = `./${importPath}`;

    if (this.codeGen.includeExtensions) {
      return importPath;
    }
  }

  getZodTypeForCode(type: ConjureApi.IType): string {
    switch (type.type) {
      case "external":
        return this.getZodTypeForCode(type.external.fallback);

      case "list":
        return `$z.array(${this.getZodTypeForCode(type.list.itemType)})`;

      case "map":
        return `$z.record(${
          this.getZodTypeForCode(
            type.map.keyType,
          )
        }, ${this.getZodTypeForCode(type.map.valueType)})`;

      case "set":
        return `$z.array(${this.getZodTypeForCode(type.set.itemType)})`;

      case "optional":
        return `$z.union([${
          this.getZodTypeForCode(
            type.optional.itemType,
          )
        }.optional(), $z.null(), $z.undefined()])`;

      case "primitive":
        switch (type.primitive) {
          case "ANY":
            return "$z.any()";
          case "BEARERTOKEN":
            return "$z.string()";
          case "BINARY":
            return "$z.string()";
          case "BOOLEAN":
            return "$z.boolean()";
          case "DATETIME":
            return "$z.string()";
          case "DOUBLE":
            return `$z.union([$z.number(), $z.literal("NaN"), $z.literal("Infinity"), $z.literal("-Infinity")])`;
          case "INTEGER":
            return "$z.number()";
          case "RID":
            return "$z.string()";
          case "SAFELONG":
            return "$z.number()";
          case "STRING":
            return "$z.string()";
          case "UUID":
            return "$z.string().uuid()";
          default:
            return `/* OOPS */ $z.any()`;
        }

      case "reference":
        //
        this.ensureImportForType(type.reference);

        if (this.codeGen.getFilePath(type.reference) === this.filePath) {
          // local ref
          return type.reference.name;
        }

        return `${
          this.codeGen.getShortPackage(type.reference.package).replaceAll(".", "_")
        }_${type.reference.name}`;
    }
  }

  getTypeForCode(type: ConjureApi.IType): string {
    this.ensureImportForType(type);

    switch (type.type) {
      case "external":
        return this.getTypeForCode(type.external.fallback);

      case "list":
        return `Array<${this.getTypeForCode(type.list.itemType)}>`;

      case "set":
        return `Array<${this.getTypeForCode(type.set.itemType)}>`;

      case "optional":
        return `${this.getTypeForCode(type.optional.itemType)} | null | undefined`;

      case "map":
        return `Record<${this.getTypeForCode(type.map.keyType)}, ${
          this.getTypeForCode(type.map.valueType)
        }>`;

      case "primitive":
        switch (type.primitive) {
          case "ANY":
            return "any";
          case "BEARERTOKEN":
            return "string";
          case "BINARY":
            return "string";
          case "BOOLEAN":
            return "boolean";
          case "DATETIME":
            return "string";
          case "DOUBLE":
            return `number | "NaN" | "Infinity" | "-Infinity"`;
          case "INTEGER":
            return "number";
          case "RID":
            return "string";
          case "SAFELONG":
            return "number";
          case "STRING":
            return "string";
          case "UUID":
            return "string";
          default:
            return `/* OOPS */ any`;
        }

      case "reference": {
        if (this.codeGen.getFilePath(type.reference) === this.filePath) {
          // local ref
          return type.reference.name;
        }

        return `${
          this.codeGen.getShortPackage(type.reference.package).replaceAll(".", "_")
        }_${type.reference.name}`;
      }
    }

    return `/* OOOOOOPS */any`;
  }

  async writeFile(body: string) {
    await writeCodeFile(
      this.filePath,
      `${this.codeGen.header}${this.codeGen.header.length > 0 ? "\n" : ""}${
        Array.from(this.imports.values()).join("\n")
      }${this.imports.size > 0 ? "\n" : ""}${body}`,
    );
  }
}
