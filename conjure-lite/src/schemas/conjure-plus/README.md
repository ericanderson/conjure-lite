# Conjure Plus Schemas

This directory contains extended versions of the Conjure schemas that add support for `x-tags` metadata.

## What's New

The `conjure-plus` schemas extend the original Conjure schemas with optional `x-tags` fields:

### Fields with x-tags Support

- **Field Definitions**: Individual fields can now have `x-tags` metadata
- **Object Types**: Object type definitions can have `x-tags` at the object level
- **Union Types**: Union type definitions can have `x-tags`
- **Enum Types**: Enum type definitions can have `x-tags`
- **Alias Types**: Alias type definitions can have `x-tags`
- **Error Types**: Error type definitions can have `x-tags`

### x-tags Format

The `x-tags` field is always:

- **Optional**: You don't need to include it
- **Type**: `Record<string, string>` - a map of string keys to string values

## Usage

```typescript
import { ObjectTypeDefinitionSchema } from "./src/schemas/conjure-plus";

// Example object with x-tags support
const myObject = {
  fields: {
    name: {
      type: "string",
      "x-tags": {
        "ui-label": "Full Name",
        "validation": "required",
      },
    },
    email: "string",
  },
  "x-tags": {
    "ui-form": "user-profile",
    "category": "user-data",
  },
};

// Validate with schema
const result = ObjectTypeDefinitionSchema.safeParse(myObject);
console.log("Valid:", result.success);
```

## Schema Structure

The schemas maintain the exact same names and structure as the original Conjure schemas, but with added x-tags support:

- ✅ **Same names**: All schema names match the originals exactly
- ✅ **Extended functionality**: Adds x-tags where specified
- ✅ **Backward compatible**: All original functionality preserved
- ✅ **Type safe**: Full TypeScript support with proper inference
- ✅ **Consistent references**: Internal references updated to use extended types

## Implementation

The schemas use Zod's `.extend()` method to cleanly extend the original schemas with minimal duplication:

```typescript
// Extended schemas - inherit all original functionality plus x-tags
export const FieldDefinitionSchema = BaseFieldDefinitionSchema.extend({
  "x-tags": z.record(z.string(), z.string()).optional().describe(
    "Additional metadata tags for the field",
  ),
});

export const ObjectTypeDefinitionSchema = BaseObjectTypeDefinitionSchema.extend(
  {
    fields: z.record(/* field validation with new FieldDefinitionSchema */),
    "x-tags": z.record(z.string(), z.string()).optional().describe(
      "Additional metadata tags for the object type",
    ),
  },
);

// Hierarchical schemas - updated references to use extended types
export const NamedTypesDefinitionSchema = BaseNamedTypesDefinitionSchema.extend(
  {
    objects: z.record(
      TypeNameSchema,
      z.union([
        AliasDefinitionSchema, // Uses extended version
        ObjectTypeDefinitionSchema, // Uses extended version
        UnionTypeDefinitionSchema, // Uses extended version
        EnumTypeDefinitionSchema, // Uses extended version
      ]),
    ).optional(),
    errors: z.record(TypeNameSchema, ErrorDefinitionSchema).optional(), // Extended version
  },
);
```

This approach:

- ✅ **Minimizes duplication** - Only redefines what changes
- ✅ **Inherits all validation** - Gets original validation rules automatically
- ✅ **Maintains consistency** - Internal references use extended types throughout
- ✅ **Enables easy updates** - Changes to base schemas are inherited automatically

## Files

All files from the original `conjure` schemas are available with the same structure:

- **Extended files**: `FieldDefinition.ts`, `ObjectTypeDefinition.ts`, `UnionTypeDefinition.ts`, `EnumTypeDefinition.ts`, `AliasDefinition.ts`, `ErrorDefinition.ts`, plus their dependent files
- **Re-exported files**: All other schemas are re-exported from the original conjure schemas
- **Main export**: `index.ts` provides the same export structure as the original

Use these schemas as a drop-in replacement for the original Conjure schemas when you need x-tags support.
