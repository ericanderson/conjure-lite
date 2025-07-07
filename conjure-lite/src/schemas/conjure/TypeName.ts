import { z } from "zod/v4";

/**
 * Named types must be in PascalCase and be unique within a package.
 */
export const TypeNameSchema = z.string().regex(
  /^([a-zA-Z][a-zA-Z0-9]*\.)?[A-Z][a-zA-Z0-9]*$/,
  { error: "Type names must be in PascalCase" },
);

export type TypeName = z.infer<typeof TypeNameSchema>;
