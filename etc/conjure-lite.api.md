## API Report File for "conjure-lite"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts
// @public (undocumented)
export interface ConjureContext {
  // (undocumented)
  baseUrl: string;
  // (undocumented)
  fetchFn?: typeof fetch;
  // (undocumented)
  servicePath: string;
  // (undocumented)
  tokenProvider?: () => Promise<string>;
}

// @public (undocumented)
export function conjureFetch<T>(
  { fetchFn, baseUrl, servicePath, tokenProvider }: ConjureContext,
  url: string,
  method: string,
  body?: ArrayBuffer | Blob | FormData | URLSearchParams | null | string | {},
  params?: {
    [key: string]: string | number | boolean | any[] | undefined | null;
  },
  contentType?: "application/json" | "application/octet-stream",
  accept?: "application/json" | "application/octet-stream",
): Promise<T>;

// (No @packageDocumentation comment for this package)
```