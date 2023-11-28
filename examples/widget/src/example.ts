import type { ConjureContext } from "conjure-lite";
import type { foo } from "./generated/index.js";
import { widget } from "./generated/index.js";

const ctx: ConjureContext = {
  baseUrl: "https://localhost:8433",
  tokenProvider: () => Promise.resolve("Hi"),
  servicePath: "/myservice/api"
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const f: foo.ExampleEnum = "BAR";
await widget.WidgetService.createWidget(ctx);
await widget.WidgetService.getWidget(ctx, "ri.whatever");
