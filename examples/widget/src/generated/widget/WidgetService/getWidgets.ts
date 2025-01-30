/* sample header */
import { type ConjureContext, conjureFetch } from "conjure-lite";
import type { Widget as _widget_Widget } from "../__components.js";

/**
 * An endpoint for retrieving all widgets, with optional filtering by the date of widget creation.
 */
export async function getWidgets(
  ctx: ConjureContext,
  createdAfter: string,
  containingProperties: Array<string>,
): Promise<Array<_widget_Widget>> {
  return conjureFetch(ctx, `/widgets`, "GET", undefined, { createdAfter, containingProperties });
}
