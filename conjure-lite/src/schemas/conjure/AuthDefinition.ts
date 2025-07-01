import { z } from "zod/v4";

/**
 * A field describing an authentication mechanism.
 */
export const AuthDefinitionSchema = z.union([
  z.literal("none").describe("do not apply authorization requirements"),
  z.literal("header").describe(
    "apply an Authorization header argument/requirement to every endpoint",
  ),
  z.string().regex(
    /^cookie:.+$/,
    "apply a cookie argument/requirement to every endpoint, where the value after 'cookie:' is the cookie name",
  ),
]);

export type AuthDefinition = z.infer<typeof AuthDefinitionSchema>;
