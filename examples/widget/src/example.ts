import type { ConjureContext } from "conjure-lite";
import type { foo } from "./generated/index.js";
import { widget } from "./generated/index.js";

const ctx: ConjureContext = {
  basePath: "https://localhost:8433",
  fetchFn: fetch,
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const f: foo.ExampleEnum = "BAR";
await widget.WidgetService.createWidget(ctx);
await widget.WidgetService.getWidget(ctx, "ri.whatever");
