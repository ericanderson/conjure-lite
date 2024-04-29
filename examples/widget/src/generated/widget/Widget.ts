/* sample header */
import type { ExampleEnum } from "../foo/ExampleEnum.js";

/**
 * ExampleObject has two fields, a string description and a reference to ExampleEnum.
 */
export interface Widget {
  description: string;
  exampleEnum: ExampleEnum;
  "dash-separated": boolean;
}
