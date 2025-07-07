# Project Brief: conjure-lite

## Core Purpose
TypeScript code generator for Conjure APIs that transforms Conjure IR files into type-safe TypeScript client code. Lightweight, modern alternative with enhanced developer experience.

## Primary Goals
1. **Code Generation**: Clean, type-safe TypeScript from Conjure IR with "Conjure Plus" x-tags support
2. **Developer Experience**: Simple CLI (`conjure-lite generate --ir <file> --outDir <dir>`), optional Zod schemas, full TypeScript integration
3. **Runtime Support**: `conjureFetch` utility, `ConjureContext` configuration, authentication support

## Success Criteria
- Generates working, type-safe TypeScript clients
- Clean architecture that's extensible and maintainable
- Comprehensive testing and clear documentation

## Scope
**In**: TypeScript generation, CLI tool, runtime utilities, Zod schemas, Conjure Plus support
**Out**: Other languages, server implementation, complex auth, non-TypeScript runtime

## Constraints
- Compatible with existing Conjure IR format and conjure-api package
- Modern TypeScript/ESM patterns, Node.js 18+
- Publishable npm package with CLI binary

## Target Users
Frontend developers, full-stack teams, platform teams, library authors extending Conjure with metadata
