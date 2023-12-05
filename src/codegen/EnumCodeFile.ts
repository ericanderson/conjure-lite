import type { IEnumDefinition } from "conjure-api";
import dedent from "dedent";
import { generatorFactory } from "./generatorFactory.js";
import { getDocs } from "./getDocs.js";

export const enumCodeGenerator = generatorFactory<IEnumDefinition>(
  async function() {
    const { typeName: { name }, values, docs } = this.def;
    const source = getDocs(docs) + dedent`
      export type ${name} = ${values.map(({ value }) => `"${value}"`).join("|")};\n`;

    await this.writeFile(source);
  },
);
