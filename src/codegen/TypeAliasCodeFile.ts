import * as ConjureApi from "conjure-api";
import { BaseFileGenerator } from "./BaseFileGenerator.js";
import { CodeGen } from "./CodeGen.js";

export class TypeAliasCodeFile extends BaseFileGenerator {
  name: string;
  target: ConjureApi.IType;
  constructor(
    filePath: string,
    codeGen: CodeGen,
    name: string,
    target: ConjureApi.IType,
  ) {
    super(filePath, codeGen);
    this.name = name;
    this.target = target;
  }

  async generate() {
    const source = `
    export type ${this.name} = ${this.getTypeForCode(this.target)}
        
    `;

    await this.writeFile(source);
  }
}
