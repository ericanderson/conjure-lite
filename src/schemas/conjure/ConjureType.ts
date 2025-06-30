import { z } from "zod";
import { BuiltInSchema } from "./BuiltIn.js";
import { ContainerTypeSchema } from "./ContainerType.js";
import { TypeNameSchema } from "./TypeName.js";

/**
 * A ConjureType is either a reference to an existing TypeName, a ContainerType or a BuiltIn.
 */
export const ConjureTypeSchema = z.union([
  TypeNameSchema,
  ContainerTypeSchema,
  BuiltInSchema,
]);

export type ConjureType = z.infer<typeof ConjureTypeSchema>;
