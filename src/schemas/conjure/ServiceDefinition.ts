import { z } from "zod/v4";
import { AuthDefinitionSchema } from "./AuthDefinition.js";
import { DocStringSchema } from "./DocString.js";
import { EndpointDefinitionSchema } from "./EndpointDefinition.js";
import { PathStringSchema } from "./PathString.js";

/**
 * A service is a collection of endpoints.
 * Package names should follow the Java style naming convention: com.example.name.
 */
export const ServiceDefinitionSchema = z.object({
  package: z.string().describe("The package of the service"),
  "base-path": PathStringSchema.describe(
    "The base path of the service. The path MUST have a leading /. The base path is prepended to each endpoint path to construct the final URL. Path parameters are not allowed",
  ),
  "default-auth": AuthDefinitionSchema.describe(
    "The default authentication mechanism for all endpoints in the service",
  ),
  docs: DocStringSchema.optional(),
  endpoints: z.record(z.string(), EndpointDefinitionSchema).describe(
    "A map of endpoint names to endpoint definitions",
  ),
});

export type ServiceDefinition = z.infer<typeof ServiceDefinitionSchema>;
