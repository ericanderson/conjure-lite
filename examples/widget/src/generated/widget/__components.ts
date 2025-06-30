/* sample header */
import * as $z from "zod";
import { ExampleEnum as _foo_ExampleEnum } from "../foo/__components.js";

/**
 * ExampleObject has two fields, a string description and a reference to ExampleEnum.
 */
export interface AWidget2 {
  "dash-separated": boolean;
  description: string;
  exampleEnum: _foo_ExampleEnum;
}
export const AWidget2 = $z.object({
  "dash-separated": $z.boolean(),
  description: $z.string(),
  exampleEnum: $z.lazy(() => _foo_ExampleEnum),
});
/**
 * ExampleObject has two fields, a string description and a reference to ExampleEnum.
 */
export interface Widget {
  "dash-separated": boolean;
  description: string;
  exampleEnum: _foo_ExampleEnum;
}
export const Widget = $z.object({
  "dash-separated": $z.boolean(),
  description: $z.string(),
  exampleEnum: $z.lazy(() => _foo_ExampleEnum),
});
