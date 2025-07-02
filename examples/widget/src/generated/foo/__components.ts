/* sample header */
import * as $z from "zod/v4";

/**
 * Valid values for ExampleEnum include "FOO" and "BAR".
 */
export type ExampleEnum = "FOO" | "BAR";
export const ExampleEnum = $z.union([
  $z.literal("FOO"),
  $z.literal("BAR"),
]);
