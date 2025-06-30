import { z } from "zod/v4";
import { ServiceDefinitionSchema } from "./ServiceDefinition.js";
import { TypesDefinitionSchema } from "./TypesDefinition.js";

/**
 * Each source file must be a YAML object with the following allowed fields.
 * All field names in the specification are case sensitive.
 * Service names MUST be in PascalCase.
 */
export const ConjureSourceFileSchema = z.object({
  types: TypesDefinitionSchema.optional().describe("The types to be included in the definition"),
  services: z.record(
    z.string().regex(
      /^[A-Z][a-zA-Z0-9]*$/,
      "Service names must be in PascalCase",
    ),
    ServiceDefinitionSchema,
  ).optional().describe("A map between a service name and its definition"),
});

export type ConjureSourceFile = z.infer<typeof ConjureSourceFileSchema>;
