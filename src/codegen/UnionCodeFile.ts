import type { IFieldDefinition, IUnionDefinition } from "conjure-api";
import dedent from "dedent";
import { generatorFactory } from "./generatorFactory.js";

export const unionCodeGenerator = generatorFactory<IUnionDefinition>(
  async function() {
    const { typeName: { name }, union } = this.def;
    

    const createUnionInterface = (u: IFieldDefinition) => {
      return dedent`
        export interface ${name}_${u.fieldName} {
            type: "${u.fieldName}";
            ${u.fieldName}: ${this.getTypeForCode(u.type)}
        }\n`;
    };

    const source = dedent`
        ${union.map(createUnionInterface).join("\n")}

        export type ${name} = ${union.map(u => `${name}_${u.fieldName}`).join(" | ")}
    `;

    await this.writeFile(source);
  },
);
