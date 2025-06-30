/* sample header */
import * as $z from "zod";

/**
 * Valid values for ExampleEnum include "FOO" and "BAR".
 */
export type ExampleEnum = "FOO" | "BAR";
export const ExampleEnum = $z.union([
  $z.literal("FOO"),
  $z.literal("BAR"),
]);
