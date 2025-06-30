import { z } from "zod";

/**
 * A PathString consists of segments separated by forward slashes, /.
 * Segments may be literals (any alphanumeric string beginning with a letter and may contain the characters ., _, -)
 * or path parameters (marked with curly braces {}).
 *
 * When comparing multiple paths, the path with the longest concrete path should be matched first.
 */
export const PathStringSchema = z.string().regex(
  /^\/[a-zA-Z0-9._\-{}/]*$/,
  "Path must start with / and contain only valid path characters and parameters",
);

export type PathString = z.infer<typeof PathStringSchema>;
