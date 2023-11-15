import { conjureFetch, type ConjureContext } from "conjure-lite"
import type { Widget } from "../Widget.js";
export async function getWidget(ctx: ConjureContext, widgetRid: string): Promise<Widget> {
  return conjureFetch(ctx, `/widgets/${widgetRid}`, "GET")
}