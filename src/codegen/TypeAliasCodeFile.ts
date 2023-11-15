import type { IAliasDefinition } from "conjure-api";
import { generatorFactory } from "./generatorFactory.js";

export const typeAliasCodeGenerator = generatorFactory<IAliasDefinition>(
  async function() {
    const { typeName: { name }, alias } = this.def;

    const source = `export type ${name} = ${this.getTypeForCode(alias)};\n`;

    await this.writeFile(source);
  },
);
