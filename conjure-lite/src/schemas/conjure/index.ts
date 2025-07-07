import { z } from "zod/v4";

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Documentation string that supports CommonMark markdown formatting.
 * Where Conjure tooling renders rich text it MUST support, at a minimum,
 * markdown syntax as described by CommonMark 0.27.
 */
export const DocString = z.string();

export type DocString = z.infer<typeof DocString>;

/**
 * The safety of the type with regard to logging in accordance with the SLS specification.
 * Allowed values are 'safe', 'unsafe', and 'do-not-log'.
 * Only conjure primitives and wrappers around conjure primitives may declare safety,
 * the safety of complex types is computed based on the type graph.
 * The exception is that 'bearertoken' is always considered 'do-not-log' and safety cannot be overridden.
 */
export const LogSafety = z.enum(["safe", "unsafe", "do-not-log"]);

export type LogSafety = z.infer<typeof LogSafety>;

/**
 * A PathString consists of segments separated by forward slashes, /.
 * Segments may be literals (any alphanumeric string beginning with a letter and may contain the characters ., _, -)
 * or path parameters (marked with curly braces {}).
 *
 * When comparing multiple paths, the path with the longest concrete path should be matched first.
 */
export const PathString = z.string().regex(
  /^\/[a-zA-Z0-9._\-{}/]*$/,
  { error: "Path must start with / and contain only valid path characters and parameters" },
);

export type PathString = z.infer<typeof PathString>;

// =============================================================================
// PRIMITIVE TYPES
// =============================================================================

/**
 * Built-in types are always lowercase, to distinguish them from user-defined types which are PascalCase.
 * Examples: any, bearertoken, binary, boolean, datetime, double, integer, rid, safelong, string, uuid
 */
export const BuiltIn = z.enum([
  "any",
  "bearertoken",
  "binary",
  "boolean",
  "datetime",
  "double",
  "integer",
  "rid",
  "safelong",
  "string",
  "uuid",
]);

export type BuiltIn = z.infer<typeof BuiltIn>;

/**
 * Named types must be in PascalCase and be unique within a package.
 */
export const TypeName = z.string().regex(
  /^([a-zA-Z][a-zA-Z0-9]*\.)?[A-Z][a-zA-Z0-9]*$/,
  { error: "Type names must be in PascalCase" },
);

export type TypeName = z.infer<typeof TypeName>;

/**
 * Container types like optional<T>, list<T>, set<T> and map<K, V> can be referenced using their lowercase names,
 * where variables like T, K and V can be substituted for a Conjure named type, a built-in or more container types.
 *
 * Examples:
 * - optional<datetime>
 * - list<double>
 * - map<string, boolean>
 * - set<SomeExistingType>
 * - map<rid, optional<datetime>>
 */
export const ContainerType = z.string().regex(
  /^(optional|list|set)<.+>$|^map<.+,.+>$/,
  { error: "Container type must be optional<T>, list<T>, set<T>, or map<K,V>" },
);

export type ContainerType = z.infer<typeof ContainerType>;

/**
 * A ConjureType is either a reference to an existing TypeName, a ContainerType or a BuiltIn.
 */
export const ConjureType = z.union([
  TypeName,
  ContainerType,
  BuiltIn,
]);

export type ConjureType = z.infer<typeof ConjureType>;

// =============================================================================
// FIELD AND DEFINITION TYPES
// =============================================================================

/**
 * Definition for a field in a complex data type.
 */
export const FieldDefinition = z.object({
  type: ConjureType,
  safety: LogSafety.optional(),
  docs: DocString.optional(),
  deprecated: DocString.optional(),
});

export type FieldDefinition = z.infer<typeof FieldDefinition>;

/**
 * Definition for a single value within an enumeration.
 * Value MUST be unique and be UPPERCASE.
 */
export const EnumValueDefinition = z.object({
  value: z.string().regex(
    /^[A-Z][A-Z0-9_]*$/,
    { error: "Enum values must be UPPERCASE" },
  ),
  docs: DocString.optional(),
  deprecated: DocString.optional(),
});

export type EnumValueDefinition = z.infer<typeof EnumValueDefinition>;

/**
 * Definition for an alias complex data type.
 */
export const AliasDefinition = z.object({
  alias: ConjureType,
  safety: LogSafety.optional(),
  docs: DocString.optional(),
  package: z.string().optional(),
});

export type AliasDefinition = z.infer<typeof AliasDefinition>;

/**
 * Definition for an object complex data type.
 * Field names must appear in either lowerCamelCase, or kebab-case, or snake_case.
 * Field names must be unique independent of case format.
 */
export const ObjectTypeDefinition = z.object({
  fields: z.record(
    z.string().regex(
      /^[a-z][a-zA-Z0-9]*$|^[a-z][a-zA-Z0-9]*(-[a-z][a-zA-Z0-9]*)*$|^[a-z][a-zA-Z0-9]*(_[a-z][a-zA-Z0-9]*)*$/,
      { error: "Field names must be in lowerCamelCase, kebab-case, or snake_case" },
    ),
    z.union([FieldDefinition, ConjureType]),
  ),
  docs: DocString.optional(),
  package: z.string().optional(),
});

export type ObjectTypeDefinition = z.infer<typeof ObjectTypeDefinition>;

/**
 * Definition for a union complex data type.
 * Union names MUST be in lowerCamelCase.
 */
export const UnionTypeDefinition = z.object({
  union: z.record(
    z.string().regex(
      /^[a-z][a-zA-Z0-9]*$/,
      { error: "Union names must be in lowerCamelCase" },
    ),
    z.union([FieldDefinition, ConjureType]),
  ),
  docs: DocString.optional(),
  package: z.string().optional(),
});

export type UnionTypeDefinition = z.infer<typeof UnionTypeDefinition>;

/**
 * Definition for an enum complex data type.
 * All elements in the values list MUST be unique and be UPPERCASE.
 */
export const EnumTypeDefinition = z.object({
  values: z.array(
    z.union([
      z.string().regex(
        /^[A-Z][A-Z0-9_]*$/,
        { error: "Enum values must be UPPERCASE" },
      ),
      EnumValueDefinition,
    ]),
  ),
  docs: DocString.optional(),
  package: z.string().optional(),
});

export type EnumTypeDefinition = z.infer<typeof EnumTypeDefinition>;

// =============================================================================
// ERROR TYPES
// =============================================================================

/**
 * A field describing the error category. MUST be one of the following strings,
 * with HTTP status codes defined in the wire spec.
 */
export const ErrorCode = z.enum([
  "PERMISSION_DENIED",
  "INVALID_ARGUMENT",
  "NOT_FOUND",
  "CONFLICT",
  "REQUEST_ENTITY_TOO_LARGE",
  "FAILED_PRECONDITION",
  "INTERNAL",
  "TIMEOUT",
  "CUSTOM_CLIENT",
  "CUSTOM_SERVER",
]);

export type ErrorCode = z.infer<typeof ErrorCode>;

/**
 * Definition for an error type.
 */
export const ErrorDefinition = z.object({
  namespace: z.string().regex(
    /^[A-Z][a-zA-Z0-9]*(\.[A-Z][a-zA-Z0-9]*)*$/,
    { error: "Namespace must be in PascalCase" },
  ),
  code: ErrorCode,
  "safe-args": z.record(
    z.string(),
    z.union([FieldDefinition, ConjureType]),
  ).optional(),
  "unsafe-args": z.record(
    z.string(),
    z.union([FieldDefinition, ConjureType]),
  ).optional(),
  docs: DocString.optional(),
});

export type ErrorDefinition = z.infer<typeof ErrorDefinition>;

// =============================================================================
// EXTERNAL TYPES
// =============================================================================

/**
 * References to types that are not defined within Conjure.
 */
export const ExternalImportDefinition = z.object({
  java: z.string().describe("The fully qualified Java type"),
});

export type ExternalImportDefinition = z.infer<typeof ExternalImportDefinition>;

/**
 * A type that is not defined within Conjure. Usage of external types is strongly discouraged
 * because Conjure is unable to validate that external types match the serialization format
 * of the base type. They are intended only to migrate existing APIs to Conjure.
 */
export const ExternalTypeDefinition = z.object({
  "base-type": ConjureType.describe(
    "A base-type is provided as a hint to generators for how to handle this type when no external type reference is provided",
  ),
  external: ExternalImportDefinition.describe("The external types to reference"),
});

export type ExternalTypeDefinition = z.infer<typeof ExternalTypeDefinition>;

// =============================================================================
// SERVICE TYPES
// =============================================================================

/**
 * A field describing the type of an endpoint parameter.
 */
export const ArgumentDefinitionParamType = z.enum([
  "auto",
  "path",
  "body",
  "header",
  "query",
]).describe(`
- auto: defined as the singular body parameter or a path parameter if the name of the argument definition matches a path parameter
- path: defined as a path parameter; the argument name must appear in the request line
- body: defined as the singular body parameter
- header: defined as a header parameter
- query: defined as a querystring parameter
`);

export type ArgumentDefinitionParamType = z.infer<typeof ArgumentDefinitionParamType>;

/**
 * An object representing an argument to an endpoint.
 * Arguments with parameter type 'body' MUST NOT be of type optional<binary>,
 * or, intuitively, of a type that reduces to optional<binary> via unfolding of alias definitions and nested optional.
 */
export const ArgumentDefinition = z.object({
  type: ConjureType,
  "param-id": z.string().optional().describe(
    "An identifier to use as a parameter value. If the param type is header or query, this field may be populated to define the identifier that is used over the wire",
  ),
  "param-type": ArgumentDefinitionParamType.optional().describe(
    "The type of the endpoint parameter. If omitted the default type is auto",
  ),
  safety: LogSafety.optional(),
  docs: DocString.optional(),
  tags: z.array(z.string()).optional().describe(
    "Set of tags that serves as additional metadata for the argument",
  ),
  markers: z.array(z.string()).optional().describe(
    "DEPRECATED. List of types that serve as additional metadata for the argument. Prefer to use tags instead of markers",
  ),
});

export type ArgumentDefinition = z.infer<typeof ArgumentDefinition>;

/**
 * A field describing an authentication mechanism.
 */
export const AuthDefinition = z.union([
  z.literal("none").describe("do not apply authorization requirements"),
  z.literal("header").describe(
    "apply an Authorization header argument/requirement to every endpoint",
  ),
  z.string().regex(
    /^cookie:.+$/,
    "apply a cookie argument/requirement to every endpoint, where the value after 'cookie:' is the cookie name",
  ),
]);

export type AuthDefinition = z.infer<typeof AuthDefinition>;

/**
 * A reference to an ErrorDefinition associated with a service endpoint.
 */
export const EndpointError = z.object({
  error: TypeName.describe("A reference to a Conjure-defined ErrorDefinition"),
  docs: DocString.optional().describe(
    "Documentation for the argument. CommonMark syntax MAY be used for rich text representation",
  ),
});

export type EndpointError = z.infer<typeof EndpointError>;

/**
 * An object representing an endpoint. An endpoint describes a method, arguments and return type.
 * The http field MUST follow the shorthand <method> <path>, where <method> is one of GET, DELETE, POST, or PUT.
 */
export const EndpointDefinition = z.object({
  http: z.string().regex(
    /^(GET|DELETE|POST|PUT)\s+\/.*/,
    "HTTP must follow the format '<method> <path>' where method is GET, DELETE, POST, or PUT",
  ),
  auth: AuthDefinition.optional().describe(
    "The authentication mechanism for the endpoint. Overrides default-auth in ServiceDefinition",
  ),
  returns: ConjureType.optional().describe(
    "The name of the return type of the endpoint. If not specified, then the endpoint does not return a value",
  ),
  errors: z.array(EndpointError).optional().describe(
    "The errors that this endpoint may return. The errors listed here should be closely tied to problems that uniquely arise from generating a response to the endpoint",
  ),
  args: z.record(
    z.string(),
    z.union([ArgumentDefinition, ConjureType]),
  ).optional().describe(
    "A map between argument names and argument definitions. If the value is a string it defaults to 'auto' ArgumentDefinition.ParamType",
  ),
  docs: DocString.optional(),
  deprecated: DocString.optional().describe(
    "Documentation for the deprecation of the endpoint",
  ),
  tags: z.array(z.string()).optional().describe(
    "Set of tags that serves as additional metadata for the endpoint",
  ),
});

export type EndpointDefinition = z.infer<typeof EndpointDefinition>;

/**
 * A service is a collection of endpoints.
 * Package names should follow the Java style naming convention: com.example.name.
 */
export const ServiceDefinition = z.object({
  package: z.string().describe("The package of the service"),
  "base-path": PathString.describe(
    "The base path of the service. The path MUST have a leading /. The base path is prepended to each endpoint path to construct the final URL. Path parameters are not allowed",
  ),
  "default-auth": AuthDefinition.describe(
    "The default authentication mechanism for all endpoints in the service",
  ),
  docs: DocString.optional(),
  endpoints: z.record(z.string(), EndpointDefinition).describe(
    "A map of endpoint names to endpoint definitions",
  ),
});

export type ServiceDefinition = z.infer<typeof ServiceDefinition>;

// =============================================================================
// COMPOSITE TYPES
// =============================================================================

/**
 * The object specifies the types that are defined in the Conjure definition.
 * Package names should follow the Java style naming convention: com.example.name.
 */
export const NamedTypesDefinition = z.object({
  "default-package": z.string().optional(),
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
 * conjure-imports: Maps namespace -> file path for referencing other YAML files
 * imports: Maps type alias -> external type definition for external Java types
 * Namespace aliases MUST match ^[_a-zA-Z][_a-zA-Z0-9]*$
 * Type aliases MUST be in PascalCase.
 */
export const TypesDefinition = z.object({
  "conjure-imports": z.record(
    z.string().regex(
      /^[_a-zA-Z][_a-zA-Z0-9]*$/,
      "Namespace aliases must match ^[_a-zA-Z][_a-zA-Z0-9]*$",
    ),
    z.string(),
  ).optional(),
  imports: z.record(TypeName, ExternalTypeDefinition).optional(),
  definitions: NamedTypesDefinition.optional(),
});

export type TypesDefinition = z.infer<typeof TypesDefinition>;

/**
 * Each source file must be a YAML object with the following allowed fields.
 * All field names in the specification are case sensitive.
 * Service names MUST be in PascalCase.
 */
export const ConjureSourceFile = z.object({
  types: TypesDefinition.optional().describe("The types to be included in the definition"),
  services: z.record(
    z.string().regex(
      /^[A-Z][a-zA-Z0-9]*$/,
      "Service names must be in PascalCase",
    ),
    ServiceDefinition,
  ).optional().describe("A map between a service name and its definition"),
}).refine((d) => d.types || d.services, {
  message: "At least one of 'types' or 'services' must be defined",
});

export type ConjureSourceFile = z.infer<typeof ConjureSourceFile>;
