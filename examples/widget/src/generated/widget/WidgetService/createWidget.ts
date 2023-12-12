import { conjureFetch, type ConjureContext } from "conjure-lite"

/**
 * An endpoint for creating a widget. Requires an "Authorization" header.
 */
export async function createWidget(ctx: ConjureContext, ): Promise<void> {
  return conjureFetch(ctx, `/widgets`, "POST")
}