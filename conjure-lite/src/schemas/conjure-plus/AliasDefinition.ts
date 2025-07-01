import { z } from "zod/v4";
import { AliasDefinitionSchema as BaseAliasDefinitionSchema } from "../conjure/AliasDefinition.js";

/**
 * Definition for an alias complex data type.
 * Extended version that includes x-tags support.
 */
export const AliasDefinitionSchema = BaseAliasDefinitionSchema.extend({
  "x-tags": z.record(z.string(), z.string()).optional().describe(
    "Additional metadata tags for the alias type",
  ),
});

export type AliasDefinition = z.infer<typeof AliasDefinitionSchema>;
