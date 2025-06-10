import type { IFieldDefinition, ITypeDefinition } from "conjure-api";
import dedent from "dedent";
import { drillIntoUnion } from "./drillIntoUnion.js";
import { fqName } from "./fqName.js";
import { generatorFactory } from "./generatorFactory.js";
import { getDocs } from "./getDocs.js";

export const objectCodeGenerator = generatorFactory<
  ITypeDefinition
>(
  async function() {
    let source = "";

    for (
      const def of this.defs.sort((a, b) => {
        return fqName(drillIntoUnion(a).typeName).localeCompare(fqName(drillIntoUnion(b).typeName));
      })
    ) {
      if (def.type === "object") {
        const { typeName: { name }, docs } = def.object;
        const fields = (def.object.fields ?? [])
          .sort((a, b) => a.fieldName.localeCompare(b.fieldName))
          .map(f =>
            `  ${
              f.fieldName.includes("-") || f.fieldName.includes("_")
                ? `"${f.fieldName}"`
                : f.fieldName
            }${f.type.type === "optional" ? "?" : ""}: ${this.getTypeForCode(f.type)};`
          )
          .join(
            "\n",
          );
        source += getDocs(docs) + dedent`
        export interface ${name} {
        ${fields}
        }
            `;
      } else if (def.type === "alias") {
        const { typeName: { name }, docs } = def.alias;

        source += getDocs(docs) + dedent`
        export type ${name} = ${this.getTypeForCode(def.alias.alias)};\n`;
      } else if (def.type === "enum") {
        const { typeName: { name }, values, docs } = def.enum;
        source += getDocs(docs) + dedent`
          export type ${name} = ${values.map(({ value }) => `"${value}"`).join("|")};\n`;
      } else if (def.type === "union") {
        const { typeName: { name }, union, docs } = def.union;

        const createUnionInterface = (u: IFieldDefinition) => {
          return dedent`
            export interface ${name}_${u.fieldName} {
                type: "${u.fieldName}";
                ${u.fieldName}: ${this.getTypeForCode(u.type)}
            }\n`;
        };

        const joined = union.map(u => `${name}_${u.fieldName}`).join(" | ");

        source += dedent`
            ${union.map(createUnionInterface).join("\n")}
            `
          + getDocs(docs)
          + dedent`
              export type ${name} = ${joined == "" ? "{}" : joined}
            \n`;
      }
    }

    await this.writeFile(source);
  },
);
