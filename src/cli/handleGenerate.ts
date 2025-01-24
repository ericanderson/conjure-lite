import type * as ConjureApi from "conjure-api";
import * as fs from "node:fs";
import { CodeGen } from "../codegen/CodeGen.js";
import type { HandleGenerateArgs } from "./HandleGenerateArgs.js";

export async function handleGenerate(args: HandleGenerateArgs) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const ir: ConjureApi.IConjureDefinition = JSON.parse(
    await fs.promises.readFile(args.ir, "utf-8"),
  );

  const codeGen = new CodeGen(ir, args);
  await codeGen.generate();
}
