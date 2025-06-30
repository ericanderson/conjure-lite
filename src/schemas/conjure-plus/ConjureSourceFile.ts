import type { z } from "zod";
import { ConjureSourceFileSchema as BaseConjureSourceFileSchema } from "../conjure/ConjureSourceFile.js";
import { TypesDefinitionSchema } from "./TypesDefinition.js";

/**
 * Each source file must be a YAML object with the following allowed fields.
 * All field names in the specification are case sensitive.
 * Service names MUST be in PascalCase.
 * Extended version that uses x-tags enabled type definitions.
 */
export const ConjureSourceFileSchema = BaseConjureSourceFileSchema.extend({
  types: TypesDefinitionSchema.optional().describe("The types to be included in the definition"),
});

export type ConjureSourceFile = z.infer<typeof ConjureSourceFileSchema>;
