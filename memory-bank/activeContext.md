# Active Context: conjure-lite

## Current Work Focus

**Code Generation Engine (Current Priority)**
- Core focus on `CodeGen.ts` orchestration layer
- File generator architecture with `BaseFileGenerator` pattern
- Modular generators: `EndpointCodeFile`, `ServiceCodeFile`, `ComponentsCodeFile`
- Template-based code generation using `dedent` for clean output

**YAML to IR Processing (Recently Completed)**
- ✅ Fully implemented conjure-imports functionality for cross-file type references
- ✅ Two-phase processing: file loading → type resolution → IR generation
- ✅ Global context management with circular import prevention
- ✅ Namespaced type resolution (`namespace.TypeName` syntax)
- ✅ Legacy function removal and test migration to file-based approach

**Schema System Enhancement**
- Dual schema support: standard Conjure + extended Conjure Plus
- Extended ConjureType schema to support namespaced imports
- Zod-based validation with extension patterns
- Runtime validation capabilities for generated code

**CLI Interface Refinement**
- `yargs`-based command structure with `generate` subcommand
- Argument validation and help generation
- Integration with code generation pipeline

## Recent Changes & Developments

### YAML to IR Processing (Major Update)
- **Implemented conjure-imports functionality**: Full cross-file type reference support
- **Two-phase processing architecture**: File loading → type registry building → IR generation
- **Global context management**: `Ctx` interface prevents circular imports and manages file dependencies
- **Namespaced type resolution**: Support for `namespace.TypeName` syntax in YAML files
- **File-based processing**: New `conjureYamlToIrFromFile()` function with automatic path resolution
- **Backward compatibility**: Maintained existing `conjureYamlToIr()` for string-based processing

### Schema Architecture
- **Extended ConjureType schema**: Added support for namespaced type names (`namespace.TypeName`)
- **Conjure Plus schemas**: Complete `x-tags` metadata support implementation
- **Schema extension patterns**: Clean Zod `.extend()` usage without duplication
- **Type validation**: Enhanced validation for cross-file type references
- **Maintained backward compatibility**: Standard Conjure schemas still fully supported

### Code Generation Pipeline
- Established modular generator architecture
- Implemented `BaseFileGenerator` abstract class
- Created specific generators for different output file types
- Added template-based generation with proper formatting

### Build & Tooling
- **Switched from pkgroll to tsup**: Improved build performance and developer experience
- Configured dual ESM/CommonJS output with tsup
- Set up comprehensive TypeScript configuration
- Implemented Vitest testing with coverage
- Added ESLint with modern flat config

## Next Steps & Priorities

### Immediate (Current Sprint)
1. **Generator Implementation**: Complete remaining file generators
   - Finalize `PackageCodeFile` for barrel exports
   - Enhance `ComponentsCodeFile` for type definitions
   - Optimize `EndpointCodeFile` template generation

2. **Testing Coverage**: Expand test suite
   - Unit tests for all generators
   - Integration tests for full CLI workflow
   - Snapshot testing for generated code consistency

3. **Error Handling**: Improve error messages and validation
   - Better Conjure IR validation errors
   - Helpful CLI error messages with suggestions
   - Graceful handling of malformed input

### Short Term (Next 2-4 weeks)
1. **Documentation**: Create comprehensive documentation
   - API reference for generated code
   - CLI usage examples and tutorials
   - Schema extension guide for Conjure Plus

2. **Performance Optimization**: Optimize generation speed
   - Parallel file generation where possible
   - Memory usage optimization for large APIs
   - Caching strategies for repeated generations

3. **Example Enhancement**: Improve example projects
   - More complex API examples
   - Real-world usage patterns
   - Integration with popular frameworks

### Medium Term (Next 1-2 months)
1. **Advanced Features**: Add sophisticated capabilities
   - Custom header injection support
   - Advanced Zod schema generation options
   - Plugin architecture for custom generators

2. **Ecosystem Integration**: Better tooling integration
   - IDE extensions for better DX
   - Build tool plugins (Vite, Webpack, etc.)
   - Framework-specific generators

## Active Decisions & Considerations

### Architecture Decisions
- **Generator Pattern**: Modular generators provide flexibility and maintainability
- **Schema Extension**: Zod extension pattern enables clean backward compatibility
- **ESM-First**: Future-proof approach with dual output for compatibility
- **Template-Based**: String templates with `dedent` provide readable generation code

### Technical Trade-offs
- **Bundle Size vs Features**: Keeping runtime dependencies minimal while providing rich features
- **Performance vs Flexibility**: Balancing generation speed with customization options
- **Type Safety vs Simplicity**: Comprehensive types without overwhelming complexity
- **Compatibility vs Innovation**: Supporting legacy while embracing modern patterns

### User Experience Priorities
- **Zero Configuration**: Should work out of the box with sensible defaults
- **Clear Errors**: Error messages should guide users to solutions
- **Predictable Output**: Generated code should follow consistent patterns
- **Fast Feedback**: Quick generation and clear progress indication

## Important Patterns & Preferences

### Code Generation Patterns
```typescript
// Template-based generation with proper typing
const generateEndpoint = (endpoint: EndpointDefinition) => dedent`
  export async function ${endpoint.endpointName}(
    ctx: ConjureContext,
    ${generateParameters(endpoint.args)}
  ): Promise<${generateReturnType(endpoint.returns)}> {
    return conjureFetch(ctx, {
      method: '${endpoint.httpMethod}',
      path: ${generatePath(endpoint.httpPath)},
      ${generateBody(endpoint.args)}
    });
  }
`;
```

### Schema Extension Patterns
```typescript
// Clean extension without duplication
export const ExtendedSchema = BaseSchema.extend({
  "x-tags": z.record(z.string(), z.string()).optional().describe(
    "Additional metadata tags"
  )
});
```

### Error Handling Patterns
```typescript
// Helpful error messages with context
if (!result.success) {
  throw new Error(
    `Invalid Conjure IR: ${result.error.issues.map(i => 
      `${i.path.join('.')}: ${i.message}`
    ).join(', ')}`
  );
}
```

## Learnings & Project Insights

### What Works Well
- **Zod Integration**: Excellent TypeScript integration and validation capabilities
- **Modular Architecture**: Easy to extend and maintain individual components
- **Template Approach**: Readable and maintainable code generation
- **ESM-First**: Future-proof and enables better tooling integration

### Challenges Encountered
- **Dual Module Support**: Complexity of supporting both ESM and CommonJS
- **Type Complexity**: Balancing comprehensive types with usability
- **Schema Evolution**: Managing backward compatibility while adding features
- **Testing Strategy**: Comprehensive testing of generated code requires careful setup

### Key Success Factors
- **Clear Separation**: Well-defined boundaries between components
- **Type Safety**: Comprehensive TypeScript usage prevents runtime errors
- **Developer Experience**: Focus on usability and clear error messages
- **Extensibility**: Architecture supports future enhancements and customization

This active context reflects the current state and immediate focus areas for conjure-lite development.
