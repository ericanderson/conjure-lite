import type * as ConjureApi from "conjure-api";

export function spreadIntoTypes(type: ConjureApi.ITypeDefinition) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return (type as any)[type.type] as
    | ConjureApi.IAliasDefinition
    | ConjureApi.IEnumDefinition
    | ConjureApi.IObjectDefinition
    | ConjureApi.IUnionDefinition;
}
