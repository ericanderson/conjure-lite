# Product Context: conjure-lite

## Why This Exists
Existing Conjure TypeScript generators have heavy dependencies, limited extensibility, poor developer experience, and don't leverage modern TypeScript features.

## Problems We Solve
1. **Type Safety at Scale**: Generate type-safe TypeScript clients from Conjure IR
2. **API Contract Consistency**: Single source of truth prevents frontend/backend drift
3. **Developer Productivity**: Automated generation vs error-prone manual clients
4. **Metadata Limitations**: "Conjure Plus" x-tags add UI-specific metadata
5. **Runtime Integration**: `conjureFetch` and `ConjureContext` for seamless auth/config

## Ideal User Journey
1. Backend defines API in Conjure YAML
2. Conjure compiler generates IR JSON
3. `conjure-lite generate --ir api.json --outDir src/generated`
4. Frontend imports with full TypeScript support
5. Runtime integration with `ConjureContext`

## User Experience Goals
- **Zero Configuration**: Works out of the box
- **Full Type Safety**: Complete TypeScript/IntelliSense support
- **Modern Patterns**: ESM, async/await, Promise-based APIs
- **Clear Errors**: Helpful debugging information
- **Fast Generation**: Under 30 seconds for most APIs

## Differentiators vs Competitors
- **Lightweight**: Minimal dependencies, fast generation
- **Extensible**: Conjure Plus schemas enable custom metadata
- **Modern**: Latest TypeScript features, ESM-first
- **Developer-Focused**: Excellent DX with clear APIs
