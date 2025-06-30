import { z } from "zod";
import { DocStringSchema } from "./DocString.js";

/**
 * Definition for a single value within an enumeration.
 * Value MUST be unique and be UPPERCASE.
 */
export const EnumValueDefinitionSchema = z.object({
  value: z.string().regex(
    /^[A-Z][A-Z0-9_]*$/,
    "Enum values must be UPPERCASE",
  ),
  docs: DocStringSchema.optional(),
  deprecated: DocStringSchema.optional(),
});

export type EnumValueDefinition = z.infer<typeof EnumValueDefinitionSchema>;
