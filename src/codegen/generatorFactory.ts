import type * as ConjureApi from "conjure-api";
import { BaseFileGenerator } from "./BaseFileGenerator.js";
import type { CodeGen } from "./CodeGen.js";

export function generatorFactory<
  T extends
    | ConjureApi.IServiceDefinition
    | ConjureApi.IEndpointDefinition
    | ConjureApi.ITypeDefinition
    | { packageName: string },
>(
  generateFunction: (this: BaseFileGenerator<T>) => Promise<void>,
): (filePath: string, codeGen: CodeGen, def: T | T[]) => () => Promise<void> {
  return (filePath: string, codeGen: CodeGen, def: T | T[]) => {
    return async () => {
      const base = new BaseFileGenerator(filePath, codeGen, def);
      await generateFunction.apply(base);
    };
  };
}
