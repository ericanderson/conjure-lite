import * as ConjureApi from "conjure-api";
import * as path from "node:path";
import { writeCodeFile } from "../util/writeCodeFile.js";
import { CodeGen } from "./CodeGen.js";

export class BaseFileGenerator {
  protected readonly filePath: string;
  protected readonly codeGen: CodeGen;
  protected readonly imports = new Map<string, string>();

  constructor(
    filePath: string,
    codeGen: CodeGen,
  ) {
    this.filePath = filePath;
    this.codeGen = codeGen;
  }

  ensureImportForType(type: ConjureApi.IType): void {
    switch (type.type) {
      case "list":
        this.ensureImportForType(type.list.itemType);
        return;

      case "primitive":
        return;

      case "reference":
        let importPath = path.relative(
          path.dirname(this.filePath),
          this.codeGen.getFilePathForImport(type.reference),
        );
        if (importPath != ".") importPath = `./${importPath}`;

        this.imports.set(
          `${type.reference.package}.${type.reference.name}`,
          `import { ${type.reference.name} } from "${importPath}";`,
        );
        return;

      case "optional":
        this.ensureImportForType(type.optional.itemType);
        return;
    }

    return;
  }

  getTypeForCode(type: ConjureApi.IType): string {
    this.ensureImportForType(type);

    switch (type.type) {
      case "list":
        return `Array<${this.getTypeForCode(type.list.itemType)}>`;

      case "set":
        return `Array<${this.getTypeForCode(type.set.itemType)}>`;

      case "optional":
        return `${this.getTypeForCode(type.optional.itemType)} | undefined`;

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

  protected async writeFile(body: string) {
    await writeCodeFile(
      this.filePath,
      `${Array.from(this.imports.values()).join("\n")}

      ${body}
      `,
    );
  }
}
