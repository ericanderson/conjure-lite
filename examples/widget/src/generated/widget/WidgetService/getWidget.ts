/* sample header */
import { type ConjureContext, conjureFetch } from "conjure-lite";
import { Widget as _widget_Widget } from "../__components.js";

/**
 * An endpoint for retrieving a widget. The RID of the desired widget is specified in the path of the request.
 */
export async function getWidget(ctx: ConjureContext, widgetRid: string): Promise<_widget_Widget> {
  return conjureFetch(ctx, `/widgets/${widgetRid}`, "GET");
}
