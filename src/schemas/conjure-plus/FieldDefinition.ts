import { z } from "zod/v4";
import { FieldDefinitionSchema as BaseFieldDefinitionSchema } from "../conjure/FieldDefinition.js";

/**
 * Definition for a field in a complex data type.
 * Extended version that includes x-tags support.
 */
export const FieldDefinitionSchema = BaseFieldDefinitionSchema.extend({
  "x-tags": z.record(z.string(), z.string()).optional().describe(
    "Additional metadata tags for the field",
  ),
});

export type FieldDefinition = z.infer<typeof FieldDefinitionSchema>;
