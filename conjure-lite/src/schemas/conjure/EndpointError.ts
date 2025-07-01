import { z } from "zod/v4";
import { DocStringSchema } from "./DocString.js";
import { TypeNameSchema } from "./TypeName.js";

/**
 * A reference to an ErrorDefinition associated with a service endpoint.
 */
export const EndpointErrorSchema = z.object({
  error: TypeNameSchema.describe("A reference to a Conjure-defined ErrorDefinition"),
  docs: DocStringSchema.optional().describe(
    "Documentation for the argument. CommonMark syntax MAY be used for rich text representation",
  ),
});

export type EndpointError = z.infer<typeof EndpointErrorSchema>;
