import { z } from "zod/v4";
import { ArgumentDefinitionParamTypeSchema } from "./ArgumentDefinitionParamType.js";
import { ConjureTypeSchema } from "./ConjureType.js";
import { DocStringSchema } from "./DocString.js";
import { LogSafetySchema } from "./LogSafety.js";

/**
 * An object representing an argument to an endpoint.
 * Arguments with parameter type 'body' MUST NOT be of type optional<binary>,
 * or, intuitively, of a type that reduces to optional<binary> via unfolding of alias definitions and nested optional.
 */
export const ArgumentDefinitionSchema = z.object({
  type: ConjureTypeSchema,
  "param-id": z.string().optional().describe(
    "An identifier to use as a parameter value. If the param type is header or query, this field may be populated to define the identifier that is used over the wire",
  ),
  "param-type": ArgumentDefinitionParamTypeSchema.optional().describe(
    "The type of the endpoint parameter. If omitted the default type is auto",
  ),
  safety: LogSafetySchema.optional(),
  docs: DocStringSchema.optional(),
  tags: z.array(z.string()).optional().describe(
    "Set of tags that serves as additional metadata for the argument",
  ),
  markers: z.array(z.string()).optional().describe(
    "DEPRECATED. List of types that serve as additional metadata for the argument. Prefer to use tags instead of markers",
  ),
});

export type ArgumentDefinition = z.infer<typeof ArgumentDefinitionSchema>;
