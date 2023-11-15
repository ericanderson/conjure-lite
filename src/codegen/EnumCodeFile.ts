import type { IEnumDefinition } from "conjure-api";
import { generatorFactory } from "./generatorFactory.js";

export const enumCodeGenerator = generatorFactory<IEnumDefinition>(
  async function() {
    const { typeName: { name }, values } = this.def;
    const source = `
      export type ${name} = ${values.map(({ value }) => `"${value}"`).join("|")};\n`;

    await this.writeFile(source);
  },
);
