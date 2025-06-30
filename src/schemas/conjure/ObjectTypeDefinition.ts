import { z } from "zod";
import { ConjureTypeSchema } from "./ConjureType.js";
import { DocStringSchema } from "./DocString.js";
import { FieldDefinitionSchema } from "./FieldDefinition.js";

/**
 * Definition for an object complex data type.
 * Field names must appear in either lowerCamelCase, or kebab-case, or snake_case.
 * Field names must be unique independent of case format.
 */
export const ObjectTypeDefinitionSchema = z.object({
  fields: z.record(
    z.string().regex(
      /^[a-z][a-zA-Z0-9]*$|^[a-z][a-zA-Z0-9]*(-[a-z][a-zA-Z0-9]*)*$|^[a-z][a-zA-Z0-9]*(_[a-z][a-zA-Z0-9]*)*$/,
      "Field names must be in lowerCamelCase, kebab-case, or snake_case",
    ),
    z.union([FieldDefinitionSchema, ConjureTypeSchema]),
  ),
  docs: DocStringSchema.optional(),
  package: z.string().optional(),
});

export type ObjectTypeDefinition = z.infer<typeof ObjectTypeDefinitionSchema>;
