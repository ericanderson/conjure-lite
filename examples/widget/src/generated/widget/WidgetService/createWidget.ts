import { conjureFetch, type ConjureContext } from "conjure-lite"
export async function createWidget(ctx: ConjureContext, ): Promise<void> {
  return conjureFetch(ctx, `/widgets`, "POST")
}