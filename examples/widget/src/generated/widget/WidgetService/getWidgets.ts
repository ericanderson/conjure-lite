import { type ConjureContext, conjureFetch } from "conjure-lite";
import type { Widget } from "../Widget.js";

/**
 * An endpoint for retrieving all widgets, with optional filtering by the date of widget creation.
 */
export async function getWidgets(
  ctx: ConjureContext,
  createdAfter: string,
  containingProperties: Array<string>,
): Promise<Array<Widget>> {
  return conjureFetch(ctx, `/widgets`, "GET", undefined, { createdAfter, containingProperties });
}
