import { z } from "zod/v4";
import { DocStringSchema } from "./DocString.js";
import { EnumValueDefinitionSchema } from "./EnumValueDefinition.js";

/**
 * Definition for an enum complex data type.
 * All elements in the values list MUST be unique and be UPPERCASE.
 */
export const EnumTypeDefinitionSchema = z.object({
  values: z.array(
    z.union([
      z.string().regex(
        /^[A-Z][A-Z0-9_]*$/,
        { error: "Enum values must be UPPERCASE" },
      ),
      EnumValueDefinitionSchema,
    ]),
  ),
  docs: DocStringSchema.optional(),
  package: z.string().optional(),
});

export type EnumTypeDefinition = z.infer<typeof EnumTypeDefinitionSchema>;
