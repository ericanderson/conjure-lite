import { z } from "zod/v4";
import { ExternalTypeDefinitionSchema } from "./ExternalTypeDefinition.js";
import { NamedTypesDefinitionSchema } from "./NamedTypesDefinition.js";
import { TypeNameSchema } from "./TypeName.js";

/**
 * The object specifies the types available in the Conjure definition.
 * conjure-imports: Maps namespace -> file path for referencing other YAML files
 * imports: Maps type alias -> external type definition for external Java types
 * Namespace aliases MUST match ^[_a-zA-Z][_a-zA-Z0-9]*$
 * Type aliases MUST be in PascalCase.
 */
export const TypesDefinitionSchema = z.object({
  "conjure-imports": z.record(
    z.string().regex(
      /^[_a-zA-Z][_a-zA-Z0-9]*$/,
      "Namespace aliases must match ^[_a-zA-Z][_a-zA-Z0-9]*$",
    ),
    z.string(),
  ).optional(),
  imports: z.record(TypeNameSchema, ExternalTypeDefinitionSchema).optional(),
  definitions: NamedTypesDefinitionSchema.optional(),
});

export type TypesDefinition = z.infer<typeof TypesDefinitionSchema>;
