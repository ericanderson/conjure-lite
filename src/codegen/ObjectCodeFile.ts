import type { IObjectDefinition } from "conjure-api";
import { generatorFactory } from "./generatorFactory.js";

export const objectCodeGenerator = generatorFactory<IObjectDefinition>(
  async function() {
    const { name } = this.def.typeName;
    const source = `
    export interface ${name} {

    }
    `;
    await this.writeFile(source);
  },
);
