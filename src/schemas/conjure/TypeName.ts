import { z } from "zod";

/**
 * Named types must be in PascalCase and be unique within a package.
 */
export const TypeNameSchema = z.string().regex(
  /^[A-Z][a-zA-Z0-9]*$/,
  "Type names must be in PascalCase",
);

export type TypeName = z.infer<typeof TypeNameSchema>;
