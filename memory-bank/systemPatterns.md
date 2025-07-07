# System Patterns: conjure-lite

## Architecture Overview
Layered architecture with clear separation:
```
CLI (yargs) → Command Handlers → Code Generation Engine → File Generators → Schema Validation (Zod) → File System
```

## Core Design Patterns

### 1. Generator Pattern
Modular file generators with shared `BaseFileGenerator` base class
- `EndpointCodeFile`, `ServiceCodeFile`, `ComponentsCodeFile`
- Easy to add new file types, consistent output formatting

### 2. Schema Extension Pattern
Conjure Plus schemas extend base Conjure schemas using Zod
- Backward compatibility maintained, clean separation
- `BaseSchema.extend({ "x-tags": z.record(z.string()).optional() })`

### 3. Factory Pattern
`generatorFactory.ts` creates appropriate generators based on configuration
- Centralized creation logic, configuration-driven behavior

### 4. Context Pattern
`ConjureContext` interface carries configuration through API calls
- Consistent auth/config, easy to mock, flexible runtime behavior

## Key Technical Decisions

### 1. ESM-First Architecture
ES modules throughout, compile to both ESM and CommonJS
- Future-proof, better tree-shaking, aligns with TypeScript/Node.js direction

### 2. Zod for Schema Validation
Type-safe schema definitions with runtime validation capabilities
- Excellent TypeScript integration, extensible for custom validation

### 3. Modular Code Generation
Separate generators for different file types
- Single responsibility, easy testing, flexible customization

### 4. TypeScript-First Development
Strict TypeScript configuration throughout
- Type safety, better IDE support, catches errors at compile time

## Component Relationships

**Core Components:**
1. **CLI**: Entry point, argument parsing, delegates to handlers
2. **Code Generation Engine**: Orchestrates generation, manages file generators
3. **File Generators**: Endpoint, Service, Components, Package files
4. **Schema System**: Standard Conjure + Conjure Plus with x-tags
5. **Runtime Support**: `conjureFetch`, `ConjureContext`

**Data Flow:** Conjure IR → Schema Validation → Generation Engine → Multiple Generators → File System

## Critical Implementation Paths

### 1. Code Generation Pipeline
Input validation → Context creation → Generator selection → Parallel generation → File writing → Index generation

### 2. YAML to IR Processing (conjure-imports)
File loading → Context building → Type registry → Import mapping → IR generation

### 3. Runtime Integration
Context injection → URL construction → Request serialization → Response deserialization → Error handling

## Design Principles
1. **Separation of Concerns**: Each component has single responsibility
2. **Extensibility**: Plugin architecture, schema extension patterns
3. **Type Safety**: Comprehensive TypeScript, Zod validation
4. **Developer Experience**: Clear errors, consistent APIs, good documentation
5. **Performance**: Parallel generation, efficient memory usage

## Testing Patterns

### Preferred Test Structure
Use helper objects and `invariant` for type narrowing, avoid deep nesting:

```typescript
// PREFERRED: Clean, declarative
it("should handle external type imports", async () => {
  const ir = conjureYamlToIr(yaml);
  expect(ir.types).toHaveLength(1);
  
  const testObjectType = ir.types.find(t => 
    t.type === "object" && t.object.typeName.name === "TestObject"
  );
  invariant(testObjectType?.type === "object");
  
  const externalUuidType = {
    type: "external" as const,
    external: { externalReference: { package: "java.util", name: "UUID" }, fallback: primitiveStringType }
  };
  
  expect(testObjectType.object).toEqual({
    typeName: { name: "TestObject", package: "com.palantir.test" },
    fields: [{ fieldName: "id", type: externalUuidType }]
  });
});
```

### Key Testing Principles
1. Use `invariant` for type narrowing
2. Define helper objects for complex structures
3. Single comprehensive assertions with `.toEqual()`
4. Focus on behavior, not implementation
5. Minimize nesting in test logic
