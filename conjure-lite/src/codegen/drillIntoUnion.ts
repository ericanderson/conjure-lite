type UnionTypeInner_<Q extends { type: K }, K extends string> =
  (Q extends any ? (Q & { [KK in K]: KK extends keyof Q ? Q[KK] : never })
    : "wm[")[K];
export type UnionTypeInner<Q extends { type: string }> = UnionTypeInner_<Q, Q["type"]>;

export function drillIntoUnion<Q extends { type: string }>(
  conjureUnion: Q,
): UnionTypeInner<Q> {
  return (conjureUnion as any)[conjureUnion.type] as UnionTypeInner<Q>;
}
