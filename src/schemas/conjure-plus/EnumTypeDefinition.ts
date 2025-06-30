import { z } from "zod";
import { EnumTypeDefinitionSchema as BaseEnumTypeDefinitionSchema } from "../conjure/EnumTypeDefinition.js";

/**
 * Definition for an enum complex data type.
 * All elements in the values list MUST be unique and be UPPERCASE.
 * Extended version that includes x-tags support.
 */
export const EnumTypeDefinitionSchema = BaseEnumTypeDefinitionSchema.extend({
  "x-tags": z.record(z.string(), z.string()).optional().describe(
    "Additional metadata tags for the enum type",
  ),
});

export type EnumTypeDefinition = z.infer<typeof EnumTypeDefinitionSchema>;
