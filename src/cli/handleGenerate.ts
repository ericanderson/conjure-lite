import * as ConjureApi from "conjure-api";
import * as fs from "node:fs";
import * as path from "node:path";
import { CodeGen } from "../codegen/CodeGen.js";
import { EndpointCodeFile } from "../codegen/EndpointCodeFile.js";
import { EnumCodeFile } from "../codegen/EnumCodeFile.js";
import { TypeAliasCodeFile } from "../codegen/TypeAliasCodeFile.js";
import { UnionCodeFile } from "../codegen/UnionCodeFile.js";
import { formatTs, writeCodeFile } from "../util/writeCodeFile.js";
import { HandleGenerateArgs } from "./HandleGenerateArgs.js";

export async function handleGenerate(args: HandleGenerateArgs) {
  const ir: ConjureApi.IConjureDefinition = JSON.parse(
    await fs.promises.readFile(args.ir, "utf-8"),
  );

  const codeGen = new CodeGen(ir, args);

  for (const type of ir.types) {
    if (type.type === "object") {
      await writeCodeFile(
        codeGen.getFilePath(type.object.typeName),
        await formatTs(`export interface ${type.object.typeName.name} {}`),
      );
    } else if (type.type === "alias") {
      new TypeAliasCodeFile(
        codeGen.getFilePath(type.alias.typeName),
        codeGen,
        type.alias.typeName.name,
        type.alias.alias,
      ).generate();
    } else if (type.type === "enum") {
      new EnumCodeFile(
        codeGen.getFilePath(type.enum.typeName),
        codeGen,
        type,
      ).generate();
    } else if (type.type === "union") {
      new UnionCodeFile(
        codeGen.getFilePath(type.union.typeName),
        codeGen,
        type,
      ).generate();
    } else {
      throw new Error(`Not implemented: ${(type as any).type}`);
    }
  }

  for (const service of ir.services) {
    const serviceDir = path.join(codeGen.getPathDir(service.serviceName), service.serviceName.name);
    await fs.promises.mkdir(serviceDir, {
      recursive: true,
    });

    for (const endpoint of service.endpoints) {
      const endpointFilePath = `${path.join(serviceDir, endpoint.endpointName)}.ts`;
      const endpointCodeFile = new EndpointCodeFile(endpointFilePath, codeGen, service, endpoint);
      endpointCodeFile.generate();
    }

    await fs.promises.writeFile(
      `${args.outDir}/${service.serviceName.name}.ts`,
      `export interface ${service.serviceName.name} {}`,
      "utf-8",
    );
  }
}
