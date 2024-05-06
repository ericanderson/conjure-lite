import type * as ConjureApi from "conjure-api";
import { BaseFileGenerator } from "./BaseFileGenerator.js";
import type { CodeGen } from "./CodeGen.js";

export function generatorFactory<
  T extends
    | ConjureApi.IUnionDefinition
    | ConjureApi.IAliasDefinition
    | ConjureApi.IServiceDefinition
    | ConjureApi.IEnumDefinition
    | ConjureApi.IEndpointDefinition,
>(
  generateFunction: (this: BaseFileGenerator<T>) => Promise<void>,
) {
  return (filePath: string, codeGen: CodeGen, def: T) => {
    return async () => {
      const base = new BaseFileGenerator(filePath, codeGen, def);
      await generateFunction.apply(base);
    };
  };
}
