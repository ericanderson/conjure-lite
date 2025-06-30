import { z } from "zod";
import { ArgumentDefinitionSchema } from "./ArgumentDefinition.js";
import { AuthDefinitionSchema } from "./AuthDefinition.js";
import { ConjureTypeSchema } from "./ConjureType.js";
import { DocStringSchema } from "./DocString.js";
import { EndpointErrorSchema } from "./EndpointError.js";

/**
 * An object representing an endpoint. An endpoint describes a method, arguments and return type.
 * The http field MUST follow the shorthand <method> <path>, where <method> is one of GET, DELETE, POST, or PUT.
 */
export const EndpointDefinitionSchema = z.object({
  http: z.string().regex(
    /^(GET|DELETE|POST|PUT)\s+\/.*/,
    "HTTP must follow the format '<method> <path>' where method is GET, DELETE, POST, or PUT",
  ),
  auth: AuthDefinitionSchema.optional().describe(
    "The authentication mechanism for the endpoint. Overrides default-auth in ServiceDefinition",
  ),
  returns: ConjureTypeSchema.optional().describe(
    "The name of the return type of the endpoint. If not specified, then the endpoint does not return a value",
  ),
  errors: z.array(EndpointErrorSchema).optional().describe(
    "The errors that this endpoint may return. The errors listed here should be closely tied to problems that uniquely arise from generating a response to the endpoint",
  ),
  args: z.record(
    z.string(),
    z.union([ArgumentDefinitionSchema, ConjureTypeSchema]),
  ).optional().describe(
    "A map between argument names and argument definitions. If the value is a string it defaults to 'auto' ArgumentDefinition.ParamType",
  ),
  docs: DocStringSchema.optional(),
  deprecated: DocStringSchema.optional().describe(
    "Documentation for the deprecation of the endpoint",
  ),
  tags: z.array(z.string()).optional().describe(
    "Set of tags that serves as additional metadata for the endpoint",
  ),
});

export type EndpointDefinition = z.infer<typeof EndpointDefinitionSchema>;
