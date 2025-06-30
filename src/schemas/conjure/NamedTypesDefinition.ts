import { z } from "zod/v4";
import { AliasDefinitionSchema } from "./AliasDefinition.js";
import { EnumTypeDefinitionSchema } from "./EnumTypeDefinition.js";
import { ErrorDefinitionSchema } from "./ErrorDefinition.js";
import { ObjectTypeDefinitionSchema } from "./ObjectTypeDefinition.js";
import { TypeNameSchema } from "./TypeName.js";
import { UnionTypeDefinitionSchema } from "./UnionTypeDefinition.js";

/**
 * The object specifies the types that are defined in the Conjure definition.
 * Package names should follow the Java style naming convention: com.example.name.
 */
export const NamedTypesDefinitionSchema = z.object({
  "default-package": z.string().optional(),
  objects: z.record(
    TypeNameSchema,
    z.union([
      AliasDefinitionSchema,
      ObjectTypeDefinitionSchema,
      UnionTypeDefinitionSchema,
      EnumTypeDefinitionSchema,
    ]),
  ).optional(),
  errors: z.record(TypeNameSchema, ErrorDefinitionSchema).optional(),
});

export type NamedTypesDefinition = z.infer<typeof NamedTypesDefinitionSchema>;
