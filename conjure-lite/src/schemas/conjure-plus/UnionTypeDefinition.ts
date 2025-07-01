import { z } from "zod/v4";
import { ConjureTypeSchema } from "../conjure/ConjureType.js";
import { UnionTypeDefinitionSchema as BaseUnionTypeDefinitionSchema } from "../conjure/UnionTypeDefinition.js";
import { FieldDefinitionSchema } from "./FieldDefinition.js";

/**
 * Definition for a union complex data type.
 * Union names MUST be in lowerCamelCase.
 * Extended version that includes x-tags support.
 */
export const UnionTypeDefinitionSchema = BaseUnionTypeDefinitionSchema.extend({
  union: z.record(
    z.string().regex(
      /^[a-z][a-zA-Z0-9]*$/,
      { error: "Union names must be in lowerCamelCase" },
    ),
    z.union([FieldDefinitionSchema, ConjureTypeSchema]),
  ),
  "x-tags": z.record(z.string(), z.string()).optional().describe(
    "Additional metadata tags for the union type",
  ),
});

export type UnionTypeDefinition = z.infer<typeof UnionTypeDefinitionSchema>;
