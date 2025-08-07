# conjure-lite

A compact, tree-shakable version of a Conjure generator and runtime.

## Overview

conjure-lite is a rewrite of the original [Conjure](https://github.com/palantir/conjure) project designed to be optimized for tree shaking and a minimal runtime. It provides both a CLI for generating TypeScript interfaces and a runtime for calling them.

Conjure is a code generation framework that allows you to define your APIs in a language-neutral way and generate client libraries across multiple languages. conjure-lite focuses specifically on TypeScript, with an emphasis on minimal runtime overhead and modern bundling practices.

## Features

- **Dual functionality**: Works as both a code generator and runtime client
- **Tree-shakable architecture**: No bundle penalty for the generator when used as a runtime
- **TypeScript first**: Generates clean, idiomatic TypeScript interfaces
- **Zod schema generation**: Optional generation of Zod schemas for runtime validation
- **Minimal runtime cost**: Generated interfaces depend only on a lightweight runtime (~137 lines), with Zod schemas included only when used
- **Combined package**: Generator and runtime in one package, ensuring version compatibility

## Prerequisites

- **Node.js**: Version 16.0.0 or higher
- **TypeScript**: Version 4.5 or higher (for projects using the generated code)
- **Package Manager**: npm, yarn, or pnpm

### Supported Inputs
- Conjure IR JSON files (generated from Conjure definitions)
- Conjure YAML files (will be converted to IR internally)

## Installation

```bash
# Using npm
npm install conjure-lite

# Using yarn
yarn add conjure-lite

# Using pnpm
pnpm add conjure-lite
```

## Usage

### Generating code from a Conjure IR file

```bash
npx conjure-lite generate --in path/to/ir.json --outDir src/generated

# With Zod schemas
npx conjure-lite generate --in path/to/ir.json --outDir src/generated --zod
```

### Using the generated code

```typescript
import { ConjureContext } from "conjure-lite";
import { myService } from "./generated/index.js";

// Create a context for API calls
const ctx: ConjureContext = {
  baseUrl: "https://api.example.com",
  servicePath: "/api",
  tokenProvider: () => Promise.resolve("your-token"), // Optional auth token provider
  // fetchFn: customFetch, // Optional custom fetch implementation
};

// Make API calls using the generated service
const result = await myService.ExampleService.getExample(ctx, "exampleId");

// Using generated Zod schemas for validation
const exampleSchema = myService.ExampleSchema;
const validationResult = exampleSchema.safeParse(data);
if (validationResult.success) {
  const validData = validationResult.data;
} else {
  console.error(validationResult.error);
}

// Error handling example
try {
  const user = await myService.UserService.getUser(ctx, userId);
  console.log(user);
} catch (error) {
  if (error.status === 404) {
    console.log("User not found");
  } else if (error.status === 401) {
    console.log("Unauthorized");
  } else {
    console.error("Unexpected error:", error);
  }
}
```

## CLI Options

| Option | Description | Default |
|--------|-------------|---------|
| `--in`, `--ir` | Path to IR JSON file or Conjure YAML file | (required) |
| `--outDir` | Directory to output generated files | (required) |
| `--includeExtensions` | Include extensions in generated code | `true` |
| `--zod` | Generate Zod schemas | `false` |
| `--header` | Custom header to add to generated files | |

## Architecture and Motivation

conjure-lite addresses several issues with traditional code generators:

1. **Bundle size and tree-shaking**: Traditional generators add bundle size and don't support tree-shaking.
2. **TypeScript integration**: Near-zero-cost abstractions for type safety with clean, idiomatic TypeScript interfaces.
3. **Optional validation**: Zod schemas provide runtime validation only when needed, with no cost when unused.
4. **Unified versioning**: Combined generator and runtime ensures compatibility without maintenance headaches.
5. **Modern module support**: Support for both ESM and CommonJS with minimal dependencies.

## Performance

- **Runtime size**: ~137 lines of runtime code
- **Tree-shaking**: Full support - unused endpoints are eliminated from bundles
- **Bundle impact**: Only includes `conjureFetch` function and type definitions for used endpoints
- **Zod schemas**: Optional, only bundled when explicitly imported

## Example Use Cases

### Local Data Validation

Useful for validating data locally using zod before fetching or for offline use.

### Experimental Features

Used in OSDK for experimental features without affecting production bundle size until ready.

### API Client Generation

Generate type-safe API clients from Conjure definitions, keeping frontend and backend in sync.

## Troubleshooting

### Common Issues

**"Module not found" errors**
- Ensure you're using `.js` extensions in imports: `import { MyService } from "./generated/MyService.js"`
- Check that `"type": "module"` is set in your package.json for ESM

**TypeScript compilation errors**
- Verify your tsconfig.json includes the generated output directory
- Ensure you're using a compatible TypeScript version (4.5+)

**Runtime errors**
- Check that your `ConjureContext` is properly configured
- Verify the `baseUrl` and `servicePath` match your API server

## License

Apache-2.0