export { conjureFetch } from "./conjureFetch.js";

export interface ConjureContext {
  fetchFn: typeof fetch;
  basePath: string;
}
