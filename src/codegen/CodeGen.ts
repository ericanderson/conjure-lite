import * as ConjureApi from "conjure-api";
import * as fs from "node:fs";
import * as path from "node:path";
import { HandleGenerateArgs } from "../cli/HandleGenerateArgs.js";
import { findCommonPrefix } from "../util/findCommonPrefix.js";
import { EndpointCodeFile } from "./EndpointCodeFile.js";

export class CodeGen {
  #outDir: string;
  #ir: ConjureApi.IConjureDefinition;
  #commonBase: string;

  readonly includeExtensions: boolean;

  constructor(ir: ConjureApi.IConjureDefinition, args: HandleGenerateArgs) {
    this.#ir = ir;
    this.#outDir = args.outDir;
    this.includeExtensions = args.includeExtensions;

    const packages = new Set<string>();

    for (const t of ir.types) {
      packages.add((t as any)[t.type].typeName.package);
      // switch (t.type) {
      //   case "object":
      //     packages.add(t.object.typeName.package);
      //     continue;
      //   case "alias":
      //     packages.add(t.alias.typeName.package);
      //     continue;
      //   case "enum":
      //     packages.add(t.enum.typeName.package);
      //     continue;
      //   case "union":
      //     packages.add(t.union.typeName.package);
      //     continue;
      // }
    }

    this.#commonBase = findCommonPrefix(Array.from(packages));
  }

  getPathDir(typeName: ConjureApi.ITypeName) {
    return path.join(
      this.#outDir,
      ...(typeName.package.substring(this.#commonBase.length).split(".")),
    );
  }

  getFilePath(typeName: ConjureApi.ITypeName) {
    return `${this.getFilePathWithoutExtension(typeName)}.ts`;
  }

  getFilePathWithoutExtension(typeName: ConjureApi.ITypeName) {
    return path.join(
      this.getPathDir(typeName),
      `${typeName.name}`,
    );
  }

  getFilePathForImport(typeName: ConjureApi.ITypeName) {
    return path.join(
      this.getPathDir(typeName),
      `${typeName.name}${this.includeExtensions ? ".js" : ""}`,
    );
  }

  async doThing(service: ConjureApi.IServiceDefinition, endpoint: ConjureApi.IEndpointDefinition) {
    const serviceDir = path.join(this.getPathDir(service.serviceName), service.serviceName.name);
    await fs.promises.mkdir(serviceDir, {
      recursive: true,
    });

    const endpointFilePath = `${path.join(serviceDir, endpoint.endpointName)}.ts`;
    const endpointCodeFile = new EndpointCodeFile(endpointFilePath, this, service, endpoint);
  }
}
