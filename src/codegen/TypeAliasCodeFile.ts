import type { IAliasDefinition } from "conjure-api";
import dedent from "dedent";
import { generatorFactory } from "./generatorFactory.js";
import { getDocs } from "./getDocs.js";

export const typeAliasCodeGenerator = generatorFactory<IAliasDefinition>(
  async function() {
    const { typeName: { name }, alias, docs } = this.def;

    const source = getDocs(docs) + dedent`
    export type ${name} = ${this.getTypeForCode(alias)};\n`;

    await this.writeFile(source);
  },
);
