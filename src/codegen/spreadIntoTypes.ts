import type * as ConjureApi from "conjure-api";

export function spreadIntoTypes(type: ConjureApi.ITypeDefinition) {
  return (type as any)[type.type] as ConjureApi.IAliasDefinition |
    ConjureApi.IEnumDefinition |
    ConjureApi.IObjectDefinition |
    ConjureApi.IUnionDefinition;
}
