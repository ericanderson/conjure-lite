import * as ConjureApi from "conjure-api";
import { BaseFileGenerator } from "./BaseFileGenerator.js";
import { CodeGen } from "./CodeGen.js";

export class UnionCodeFile extends BaseFileGenerator {
  def: ConjureApi.ITypeDefinition_Union;

  constructor(
    filePath: string,
    codeGen: CodeGen,
    def: ConjureApi.ITypeDefinition_Union,
  ) {
    super(filePath, codeGen);

    this.def = def;
  }

  get name() {
    return this.def.union.typeName.name;
  }

  async generate() {
    const source = `
    
    ${
      this.def.union.union.map(u => {
        return `
            export interface ${this.name}_${u.fieldName} {
                type: "${u.fieldName}";
                ${u.fieldName}: ${this.getTypeForCode(u.type)}
                    }        `;
      })
    }

    export type ${this.name} = ${this.def.union.union.map(u => `${this.name}_${u.fieldName}`)}
    `;

    await this.writeFile(source);
  }
}
