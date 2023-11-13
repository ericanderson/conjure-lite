import * as ConjureApi from "conjure-api";
import { BaseFileGenerator } from "./BaseFileGenerator.js";
import { CodeGen } from "./CodeGen.js";

export class EnumCodeFile extends BaseFileGenerator {
  def: ConjureApi.ITypeDefinition_Enum;

  constructor(
    filePath: string,
    codeGen: CodeGen,
    def: ConjureApi.ITypeDefinition_Enum,
  ) {
    super(filePath, codeGen);

    this.def = def;
  }

  get name() {
    return this.def.enum.typeName.name;
  }

  async generate() {
    const source = `
    export type ${this.name} = ${this.def.enum.values.map(v => `"${v.value}"`).join("|")}
        
    `;

    await this.writeFile(source);
  }
}
