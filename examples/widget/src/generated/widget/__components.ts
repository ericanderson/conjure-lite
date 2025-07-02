/* sample header */
import * as $z from "zod/v4";
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
  get "dash-separated"() {
    return $z.boolean();
  },
  get description() {
    return $z.string();
  },
  get exampleEnum() {
    return _foo_ExampleEnum;
  },
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
  get "dash-separated"() {
    return $z.boolean();
  },
  get description() {
    return $z.string();
  },
  get exampleEnum() {
    return _foo_ExampleEnum;
  },
});
