import { z } from "zod/v4";

/**
 * Container types like optional<T>, list<T>, set<T> and map<K, V> can be referenced using their lowercase names,
 * where variables like T, K and V can be substituted for a Conjure named type, a built-in or more container types.
 *
 * Examples:
 * - optional<datetime>
 * - list<double>
 * - map<string, boolean>
 * - set<SomeExistingType>
 * - map<rid, optional<datetime>>
 */
export const ContainerTypeSchema = z.string().regex(
  /^(optional|list|set)<.+>$|^map<.+,.+>$/,
  { error: "Container type must be optional<T>, list<T>, set<T>, or map<K,V>" },
);

export type ContainerType = z.infer<typeof ContainerTypeSchema>;
