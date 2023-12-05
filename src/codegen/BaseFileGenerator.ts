import type * as ConjureApi from "conjure-api";
import * as path from "node:path";
import { writeCodeFile } from "../util/writeCodeFile.js";
import type { CodeGen } from "./CodeGen.js";

export class BaseFileGenerator<D> {
  public readonly def: D;
  public readonly filePath: string;
  public readonly codeGen: CodeGen;
  public readonly imports = new Map<string, string>();

  constructor(
    filePath: string,
    codeGen: CodeGen,
    def: D,
  ) {
    this.filePath = filePath;
    this.codeGen = codeGen;
    this.def = def;
  }

  ensureImportForType(
    type: ConjureApi.IType | ConjureApi.IServiceDefinition | ConjureApi.ITypeName,
  ): void {
    if ("package" in type) {
      if (this.codeGen.getFilePath(type) === this.filePath) {
        return;
      }
      const importPath = this.getImportModuleSpecifier(type);

      this.imports.set(
        `${type.package}.${type.name}`,
        `import type { ${type.name} } from "${importPath}";`,
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
        return `${this.getTypeForCode(type.optional.itemType)} | undefined`;

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
            return "Blob";
          case "BOOLEAN":
            return "boolean";
          case "DATETIME":
            return "string";
          case "DOUBLE":
            return "string";
          case "INTEGER":
            return "string";
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

      case "reference":
        return type.reference.name;
    }

    return `/* OOOOOOPS */any`;
  }

  async writeFile(body: string) {
    await writeCodeFile(
      this.filePath,
      `${Array.from(this.imports.values()).join("\n")}\n${body}`,
    );
  }
}
