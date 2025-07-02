import { z } from "zod/v4";

/**
 * References to types that are not defined within Conjure.
 */
export const ExternalImportDefinitionSchema = z.object({
  java: z.string().describe("The fully qualified Java type"),
});

export type ExternalImportDefinition = z.infer<typeof ExternalImportDefinitionSchema>;
