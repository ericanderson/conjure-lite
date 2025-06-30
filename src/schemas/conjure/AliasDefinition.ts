import { z } from "zod";
import { ConjureTypeSchema } from "./ConjureType.js";
import { DocStringSchema } from "./DocString.js";
import { LogSafetySchema } from "./LogSafety.js";

/**
 * Definition for an alias complex data type.
 */
export const AliasDefinitionSchema = z.object({
  alias: ConjureTypeSchema,
  safety: LogSafetySchema.optional(),
  docs: DocStringSchema.optional(),
  package: z.string().optional(),
});

export type AliasDefinition = z.infer<typeof AliasDefinitionSchema>;
