import { conjureFetch, type ConjureContext } from "conjure-lite"
import type { Widget } from "../Widget.js";
export async function getWidgets(ctx: ConjureContext, createdAfter: string): Promise<Array<Widget>> {
  return conjureFetch(ctx, `/widgets?${new URLSearchParams({ "createdAfter": "" + createdAfter })}`, "GET")
}