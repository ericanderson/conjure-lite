import { z } from "zod";

/**
 * Built-in types are always lowercase, to distinguish them from user-defined types which are PascalCase.
 * Examples: any, bearertoken, binary, boolean, datetime, double, integer, rid, safelong, string, uuid
 */
export const BuiltInSchema = z.enum([
  "any",
  "bearertoken",
  "binary",
  "boolean",
  "datetime",
  "double",
  "integer",
  "rid",
  "safelong",
  "string",
  "uuid",
]);

export type BuiltIn = z.infer<typeof BuiltInSchema>;
