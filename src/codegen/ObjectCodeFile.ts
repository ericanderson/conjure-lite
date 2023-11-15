import type { IObjectDefinition } from "conjure-api";
import { generatorFactory } from "./generatorFactory.js";

export const objectCodeGenerator = generatorFactory<IObjectDefinition>(
  async function() {
    const { name } = this.def.typeName;
    const fields = this.def.fields.map(f => `  ${f.fieldName}: ${this.getTypeForCode(f.type)};`).join(
      "\n",
    );
    const source = `
export interface ${name} {
${fields}
}
    `;
    await this.writeFile(source);
  },
);
