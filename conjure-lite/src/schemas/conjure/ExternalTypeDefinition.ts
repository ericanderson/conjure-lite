import { z } from "zod/v4";
import { ConjureTypeSchema } from "./ConjureType.js";
import { ExternalImportDefinitionSchema } from "./ExternalImportDefinition.js";

/**
 * A type that is not defined within Conjure. Usage of external types is strongly discouraged
 * because Conjure is unable to validate that external types match the serialization format
 * of the base type. They are intended only to migrate existing APIs to Conjure.
 */
export const ExternalTypeDefinitionSchema = z.object({
  "base-type": ConjureTypeSchema.describe(
    "A base-type is provided as a hint to generators for how to handle this type when no external type reference is provided",
  ),
  external: ExternalImportDefinitionSchema.describe("The external types to reference"),
});

export type ExternalTypeDefinition = z.infer<typeof ExternalTypeDefinitionSchema>;
