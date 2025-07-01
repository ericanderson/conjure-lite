import { z } from "zod/v4";
import { ConjureTypeSchema } from "./ConjureType.js";
import { DocStringSchema } from "./DocString.js";
import { LogSafetySchema } from "./LogSafety.js";

/**
 * Definition for a field in a complex data type.
 */
export const FieldDefinitionSchema = z.object({
  type: ConjureTypeSchema,
  safety: LogSafetySchema.optional(),
  docs: DocStringSchema.optional(),
  deprecated: DocStringSchema.optional(),
});

export type FieldDefinition = z.infer<typeof FieldDefinitionSchema>;
