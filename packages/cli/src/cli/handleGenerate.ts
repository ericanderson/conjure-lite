import type * as ConjureApi from "conjure-api";
import * as fs from "node:fs";
import * as path from "node:path";
import { CodeGen } from "../codegen/CodeGen.js";
import { conjureYamlToIrFromFile } from "../conjureYamlToIr/conjureYamlToIr.js";
import type { HandleGenerateArgs } from "./HandleGenerateArgs.js";

export async function handleGenerate(args: HandleGenerateArgs) {
  let ir: ConjureApi.IConjureDefinition;

  const inputPath = args.in;
  const ext = path.extname(inputPath).toLowerCase();

  if (ext === ".yml" || ext === ".yaml") {
    // Convert YAML to IR
    ir = conjureYamlToIrFromFile(inputPath);

    // Write the generated IR JSON file to the output directory
    const irOutputPath = path.join(args.outDir, "generated-ir.json");
    await fs.promises.mkdir(args.outDir, { recursive: true });
    await fs.promises.writeFile(irOutputPath, JSON.stringify(ir, null, 2), "utf-8");
  } else {
    // Assume JSON format
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    ir = JSON.parse(
      await fs.promises.readFile(inputPath, "utf-8"),
    );
  }

  const codeGen = new CodeGen(ir, args);
  await codeGen.generate();
}
