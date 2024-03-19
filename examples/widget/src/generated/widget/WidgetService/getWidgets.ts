import { conjureFetch, type ConjureContext } from "conjure-lite"
import type { Widget } from "../Widget.js";

/**
 * An endpoint for retrieving all widgets, with optional filtering by the date of widget creation.
 */
export async function getWidgets(ctx: ConjureContext, createdAfter: string, containingProperties: Array<string>): Promise<Array<Widget>> {
    return conjureFetch(ctx, `/widgets?${new URLSearchParams(Object.entries({ "createdAfter": createdAfter,"containingProperties": containingProperties.join(",") }).reduce(
  (acc, [key, value]) => {
    if (value == null) {
      return acc;
    }
    const paramValue = "" + value;
    if (paramValue.length === 0) {
      return acc;
    }
    acc[key] = paramValue;
    return acc;
  },
  {} as { [key: string]: string },
))}`, "GET")
  }