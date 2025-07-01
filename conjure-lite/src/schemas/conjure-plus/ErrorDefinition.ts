import { z } from "zod/v4";
import { ConjureTypeSchema } from "../conjure/ConjureType.js";
import { ErrorDefinitionSchema as BaseErrorDefinitionSchema } from "../conjure/ErrorDefinition.js";
import { FieldDefinitionSchema } from "./FieldDefinition.js";

/**
 * Definition for an error type.
 * Extended version that includes x-tags support.
 */
export const ErrorDefinitionSchema = BaseErrorDefinitionSchema.extend({
  "safe-args": z.record(
    z.string(),
    z.union([FieldDefinitionSchema, ConjureTypeSchema]),
  ),
  "unsafe-args": z.record(
    z.string(),
    z.union([FieldDefinitionSchema, ConjureTypeSchema]),
  ),
  "x-tags": z.record(z.string(), z.string()).optional().describe(
    "Additional metadata tags for the error type",
  ),
});

export type ErrorDefinition = z.infer<typeof ErrorDefinitionSchema>;
