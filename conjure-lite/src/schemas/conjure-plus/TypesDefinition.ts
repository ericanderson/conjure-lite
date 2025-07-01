import type { z } from "zod/v4";
import { TypesDefinitionSchema as BaseTypesDefinitionSchema } from "../conjure/TypesDefinition.js";
import { NamedTypesDefinitionSchema } from "./NamedTypesDefinition.js";

/**
 * The object specifies the types available in the Conjure definition.
 * Namespace aliases MUST match ^[_a-zA-Z][_a-zA-Z0-9]*$
 * Type aliases MUST be in PascalCase.
 * Extended version that uses x-tags enabled type definitions.
 */
export const TypesDefinitionSchema = BaseTypesDefinitionSchema.extend({
  definitions: NamedTypesDefinitionSchema.optional(),
});

export type TypesDefinition = z.infer<typeof TypesDefinitionSchema>;
