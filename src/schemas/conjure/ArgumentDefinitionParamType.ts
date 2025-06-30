import { z } from "zod";

/**
 * A field describing the type of an endpoint parameter.
 */
export const ArgumentDefinitionParamTypeSchema = z.enum([
  "auto",
  "path",
  "body",
  "header",
  "query",
]).describe(`
- auto: defined as the singular body parameter or a path parameter if the name of the argument definition matches a path parameter
- path: defined as a path parameter; the argument name must appear in the request line
- body: defined as the singular body parameter
- header: defined as a header parameter
- query: defined as a querystring parameter
`);

export type ArgumentDefinitionParamType = z.infer<typeof ArgumentDefinitionParamTypeSchema>;
