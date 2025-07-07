/** @public */
export interface ConjureContext {
  fetchFn?: typeof fetch;
  tokenProvider?: () => Promise<string>;
  baseUrl: string;
  servicePath: string;
}
