import { z } from "zod/v4";
import { ConjureTypeSchema } from "./ConjureType.js";
import { DocStringSchema } from "./DocString.js";
import { ErrorCodeSchema } from "./ErrorCode.js";
import { FieldDefinitionSchema } from "./FieldDefinition.js";

/**
 * Definition for an error type.
 */
export const ErrorDefinitionSchema = z.object({
  namespace: z.string().regex(
    /^[A-Z][a-zA-Z0-9]*(\.[A-Z][a-zA-Z0-9]*)*$/,
    { error: "Namespace must be in PascalCase" },
  ),
  code: ErrorCodeSchema,
  "safe-args": z.record(
    z.string(),
    z.union([FieldDefinitionSchema, ConjureTypeSchema]),
  ).optional(),
  "unsafe-args": z.record(
    z.string(),
    z.union([FieldDefinitionSchema, ConjureTypeSchema]),
  ).optional(),
  docs: DocStringSchema.optional(),
});

export type ErrorDefinition = z.infer<typeof ErrorDefinitionSchema>;
