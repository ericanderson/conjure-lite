import { BaseFileGenerator } from "./BaseFileGenerator.js";
import type { CodeGen } from "./CodeGen.js";

export function generatorFactory<T>(
  generateFunction: (this: BaseFileGenerator<T>) => Promise<void>,
) {
  return (filePath: string, codeGen: CodeGen, def: T) => {
    return async () => {
      const base = new BaseFileGenerator(filePath, codeGen, def);
      await generateFunction.apply(base);
    };
  };
}
