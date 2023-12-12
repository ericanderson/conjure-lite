import { conjureFetch, type ConjureContext } from "conjure-lite"
import type { Widget } from "../Widget.js";

/**
 * An endpoint for retrieving all widgets, with optional filtering by the date of widget creation.
 */
export async function getWidgets(ctx: ConjureContext, createdAfter: string, containingProperties: Array<string>): Promise<Array<Widget>> {
  return conjureFetch(ctx, `/widgets?${new URLSearchParams({ "createdAfter": "" + createdAfter,"containingProperties": containingProperties.join(",") })}`, "GET")
}