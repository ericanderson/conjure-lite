import { z } from "zod/v4";

/**
 * Documentation string that supports CommonMark markdown formatting.
 * Where Conjure tooling renders rich text it MUST support, at a minimum,
 * markdown syntax as described by CommonMark 0.27.
 */
export const DocStringSchema = z.string();

export type DocString = z.infer<typeof DocStringSchema>;
