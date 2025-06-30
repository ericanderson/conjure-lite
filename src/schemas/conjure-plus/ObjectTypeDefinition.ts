import { z } from "zod";
import { ConjureTypeSchema } from "../conjure/ConjureType.js";
import { ObjectTypeDefinitionSchema as BaseObjectTypeDefinitionSchema } from "../conjure/ObjectTypeDefinition.js";
import { FieldDefinitionSchema } from "./FieldDefinition.js";

/**
 * Definition for an object complex data type.
 * Field names must appear in either lowerCamelCase, or kebab-case, or snake_case.
 * Field names must be unique independent of case format.
 * Extended version that includes x-tags support.
 */
export const ObjectTypeDefinitionSchema = BaseObjectTypeDefinitionSchema.extend({
  fields: z.record(
    z.string().regex(
      /^[a-z][a-zA-Z0-9]*$|^[a-z][a-zA-Z0-9]*(-[a-z][a-zA-Z0-9]*)*$|^[a-z][a-zA-Z0-9]*(_[a-z][a-zA-Z0-9]*)*$/,
      "Field names must be in lowerCamelCase, kebab-case, or snake_case",
    ),
    z.union([FieldDefinitionSchema, ConjureTypeSchema]),
  ),
  "x-tags": z.record(z.string(), z.string()).optional().describe(
    "Additional metadata tags for the object type",
  ),
});

export type ObjectTypeDefinition = z.infer<typeof ObjectTypeDefinitionSchema>;
