# Tech Context: conjure-lite

## Core Stack
- **TypeScript 5.8+**: Strict config, ESM-first with dual CommonJS/ESM output
- **Node.js 18+**: ESM support required for runtime and CLI
- **Zod 3.25+**: Schema validation, type generation, runtime validation
- **pnpm 9.0+**: Workspace support, efficient dependency management
- **tsup 8.5+**: Modern build tool, dual output, fast bundling
- **Vitest 3.1+**: ESM-native testing with coverage
- **yargs 18.0+**: CLI argument parsing with type safety

## Key Dependencies
- **conjure-api 4.51+**: Official Conjure type definitions and IR format
- **dedent 1.6+**: Template string formatting for clean code generation
- **tiny-invariant 1.3+**: Runtime assertions and type narrowing

## Development Setup
```bash
# Prerequisites: Node.js 18+, pnpm 9.0.6
git clone https://github.com/ericanderson/conjure-lite.git
cd conjure-lite
pnpm install
pnpm build && pnpm test
```

## Technical Constraints
- **Runtime**: Node.js 18+, efficient memory usage for large IR files
- **Compatibility**: Official Conjure IR format, TypeScript 4.5+, dual ESM/CommonJS
- **Performance**: <30s generation for large APIs, optimized bundle size

## Build Configuration
- **TypeScript**: Strict mode, ES2022 target, ESNext modules
- **Package**: Dual exports (ESM/CommonJS), CLI binary
- **Pipeline**: TS compilation → bundling → type declarations → validation

## Testing Strategy
- **Unit**: Vitest with TypeScript support, comprehensive coverage
- **Integration**: Full CLI workflow, example project validation
- **CI/CD**: GitHub Actions with lint, test, build verification

## Code Patterns
```typescript
// Template generation
const template = dedent`export async function ${name}(...)`;

// Schema extension
const Extended = Base.extend({ "x-tags": z.record(z.string()).optional() });

// File operations
await fs.promises.writeFile(path, code, 'utf-8');
```
