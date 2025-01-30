import type * as ConjureApi from "conjure-api";

export function fqName(q: ConjureApi.ITypeName): string {
  return `${q.package}.${q.name}`;
}
