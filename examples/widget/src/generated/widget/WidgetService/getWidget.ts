import { type ConjureContext, conjureFetch } from "conjure-lite";
import type { Widget } from "../Widget.js";

/**
 * An endpoint for retrieving a widget. The RID of the desired widget is specified in the path of the request.
 */
export async function getWidget(ctx: ConjureContext, widgetRid: string): Promise<Widget> {
  return conjureFetch(ctx, `/widgets/${widgetRid}`, "GET");
}
