import { z } from "zod/v4";

// Base schema imports
import {
  AliasDefinition as BaseAliasDefinition,
  ConjureSourceFile as BaseConjureSourceFile,
  ConjureType,
  EnumTypeDefinition as BaseEnumTypeDefinition,
  ErrorDefinition as BaseErrorDefinition,
  FieldDefinition as BaseFieldDefinition,
  NamedTypesDefinition as BaseNamedTypesDefinition,
  ObjectTypeDefinition as BaseObjectTypeDefinition,
  TypeName,
  TypesDefinition as BaseTypesDefinition,
  UnionTypeDefinition as BaseUnionTypeDefinition,
} from "../conjure/index.js";

// Re-exports from original conjure schema - no changes needed
export {
  ArgumentDefinition,
  ArgumentDefinitionParamType,
  AuthDefinition,
  BuiltIn,
  ConjureType,
  ContainerType,
  DocString,
  EndpointDefinition,
  EndpointError,
  EnumValueDefinition,
  ErrorCode,
  ExternalImportDefinition,
  ExternalTypeDefinition,
  LogSafety,
  PathString,
  ServiceDefinition,
  TypeName,
} from "../conjure/index.js";

// Extended schema definitions with x-tags support

/**
 * Definition for a field in a complex data type.
 * Extended version that includes x-tags support.
 */
export const FieldDefinition = BaseFieldDefinition.extend({
  "x-tags": z.record(z.string(), z.string()).optional().describe(
    "Additional metadata tags for the field",
  ),
});

export type FieldDefinition = z.infer<typeof FieldDefinition>;

/**
 * Definition for an alias complex data type.
 * Extended version that includes x-tags support.
 */
export const AliasDefinition = BaseAliasDefinition.extend({
  "x-tags": z.record(z.string(), z.string()).optional().describe(
    "Additional metadata tags for the alias type",
  ),
});

export type AliasDefinition = z.infer<typeof AliasDefinition>;

/**
 * Definition for an enum complex data type.
 * All elements in the values list MUST be unique and be UPPERCASE.
 * Extended version that includes x-tags support.
 */
export const EnumTypeDefinition = BaseEnumTypeDefinition.extend({
  "x-tags": z.record(z.string(), z.string()).optional().describe(
    "Additional metadata tags for the enum type",
  ),
});

export type EnumTypeDefinition = z.infer<typeof EnumTypeDefinition>;

/**
 * Definition for an object complex data type.
 * Field names must appear in either lowerCamelCase, or kebab-case, or snake_case.
 * Field names must be unique independent of case format.
 * Extended version that includes x-tags support.
 */
export const ObjectTypeDefinition = BaseObjectTypeDefinition.extend({
  fields: z.record(
    z.string().regex(
      /^[a-z][a-zA-Z0-9]*$|^[a-z][a-zA-Z0-9]*(-[a-z][a-zA-Z0-9]*)*$|^[a-z][a-zA-Z0-9]*(_[a-z][a-zA-Z0-9]*)*$/,
      { error: "Field names must be in lowerCamelCase, kebab-case, or snake_case" },
    ),
    z.union([FieldDefinition, ConjureType]),
  ),
  "x-tags": z.record(z.string(), z.string()).optional().describe(
    "Additional metadata tags for the object type",
  ),
});

export type ObjectTypeDefinition = z.infer<typeof ObjectTypeDefinition>;

/**
 * Definition for a union complex data type.
 * Union names MUST be in lowerCamelCase.
 * Extended version that includes x-tags support.
 */
export const UnionTypeDefinition = BaseUnionTypeDefinition.extend({
  union: z.record(
    z.string().regex(
      /^[a-z][a-zA-Z0-9]*$/,
      { error: "Union names must be in lowerCamelCase" },
    ),
    z.union([FieldDefinition, ConjureType]),
  ),
  "x-tags": z.record(z.string(), z.string()).optional().describe(
    "Additional metadata tags for the union type",
  ),
});

export type UnionTypeDefinition = z.infer<typeof UnionTypeDefinition>;

/**
 * Definition for an error type.
 * Extended version that includes x-tags support.
 */
export const ErrorDefinition = BaseErrorDefinition.extend({
  "safe-args": z.record(
    z.string(),
    z.union([FieldDefinition, ConjureType]),
  ).optional(),
  "unsafe-args": z.record(
    z.string(),
    z.union([FieldDefinition, ConjureType]),
  ).optional(),
  "x-tags": z.record(z.string(), z.string()).optional().describe(
    "Additional metadata tags for the error type",
  ),
});

export type ErrorDefinition = z.infer<typeof ErrorDefinition>;

/**
 * The object specifies the types that are defined in the Conjure definition.
 * Package names should follow the Java style naming convention: com.example.name.
 * Extended version that uses x-tags enabled type definitions.
 */
export const NamedTypesDefinition = BaseNamedTypesDefinition.extend({
  objects: z.record(
    TypeName,
    z.union([
      AliasDefinition,
      ObjectTypeDefinition,
      UnionTypeDefinition,
      EnumTypeDefinition,
    ]),
  ).optional(),
  errors: z.record(TypeName, ErrorDefinition).optional(),
});

export type NamedTypesDefinition = z.infer<typeof NamedTypesDefinition>;

/**
 * The object specifies the types available in the Conjure definition.
 * Namespace aliases MUST match ^[_a-zA-Z][_a-zA-Z0-9]*$
 * Type aliases MUST be in PascalCase.
 * Extended version that uses x-tags enabled type definitions.
 */
export const TypesDefinition = BaseTypesDefinition.extend({
  definitions: NamedTypesDefinition.optional(),
});

export type TypesDefinition = z.infer<typeof TypesDefinition>;

/**
 * Each source file must be a YAML object with the following allowed fields.
 * All field names in the specification are case sensitive.
 * Service names MUST be in PascalCase.
 * Extended version that uses x-tags enabled type definitions.
 */
export const ConjureSourceFile = BaseConjureSourceFile.extend({
  types: TypesDefinition.optional().describe("The types to be included in the definition"),
});

export type ConjureSourceFile = z.infer<typeof ConjureSourceFile>;
