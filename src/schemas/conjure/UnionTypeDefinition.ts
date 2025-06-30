import { z } from "zod";
import { ConjureTypeSchema } from "./ConjureType.js";
import { DocStringSchema } from "./DocString.js";
import { FieldDefinitionSchema } from "./FieldDefinition.js";

/**
 * Definition for a union complex data type.
 * Union names MUST be in lowerCamelCase.
 */
export const UnionTypeDefinitionSchema = z.object({
  union: z.record(
    z.string().regex(
      /^[a-z][a-zA-Z0-9]*$/,
      "Union names must be in lowerCamelCase",
    ),
    z.union([FieldDefinitionSchema, ConjureTypeSchema]),
  ),
  docs: DocStringSchema.optional(),
  package: z.string().optional(),
});

export type UnionTypeDefinition = z.infer<typeof UnionTypeDefinitionSchema>;
