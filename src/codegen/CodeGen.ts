import type * as ConjureApi from "conjure-api";
import * as fs from "node:fs";
import * as path from "node:path";
import type { HandleGenerateArgs } from "../cli/HandleGenerateArgs.js";
import { findCommonPrefix } from "../util/findCommonPrefix.js";
import { objectCodeGenerator as componentCodeGenerator } from "./ComponentsCodeFile.js";
import { drillIntoUnion } from "./drillIntoUnion.js";
import { endpointCodeGenerator } from "./EndpointCodeFile.js";
import { fqName } from "./fqName.js";
import { packageIndexCodeGenerator } from "./PackageCodeFile.js";
import { serviceCodeGenerator } from "./ServiceCodeFile.js";

export class CodeGen {
  #outDir: string;
  ir: ConjureApi.IConjureDefinition;
  #commonPackageBase: string;
  packages: Set<string>;
  header: string;

  readonly includeExtensions: boolean;

  resolvedFileForType = new Map<string, string>();
  includeZod: boolean;

  constructor(ir: ConjureApi.IConjureDefinition, args: HandleGenerateArgs) {
    this.ir = ir;
    this.#outDir = args.outDir;
    this.includeExtensions = args.includeExtensions;
    this.header = args.header ?? "";
    this.includeZod = args.zod;

    this.packages = new Set<string>();

    for (const t of ir.types) {
      this.packages.add(drillIntoUnion(t).typeName.package);
    }

    this.#commonPackageBase = findCommonPrefix(Array.from(this.packages));
  }

  async generate() {
    const codeFiles: Array<() => Promise<void>> = [];

    const completedPackages = new Set<string>();
    const actuallyAddPackage = async (packageName: string) => {
      if (packageName.endsWith(".")) {
        // special case where everything is in the common package
        return;
      }
      if (completedPackages.has(packageName)) return;

      const packagePath = this.getPackageDir(packageName);
      await fs.promises.mkdir(packagePath, { recursive: true });
      codeFiles.push(
        packageIndexCodeGenerator(path.join(packagePath, "index.ts"), this, {
          packageName,
        }, this.includeZod),
      );
      completedPackages.add(packageName);
    };

    // "root package"
    await actuallyAddPackage(this.#commonPackageBase);

    for (const fullPackageName of this.packages) {
      const partsAfterCommon = fullPackageName.substring(this.#commonPackageBase.length + 1).split(
        ".",
      );

      for (let i = 0; i < partsAfterCommon.length; i++) {
        const packageName = this.#commonPackageBase + "."
          + partsAfterCommon.slice(0, i + 1).join(".");

        await actuallyAddPackage(packageName);
      }
    }

    const f: Record<string, ConjureApi.ITypeDefinition[]> = {};
    for (const type of this.ir.types) {
      const q = drillIntoUnion(type);

      f[q.typeName.package] ??= [];
      f[q.typeName.package].push(type);

      const destinationFile = path.join(this.getPackageDir(q.typeName.package), "__components.ts");
      this.resolvedFileForType.set(fqName(q.typeName), destinationFile);
    }

    for (const [packageOfType, def] of Object.entries(f)) {
      const destinationFile = path.join(this.getPackageDir(packageOfType), "__components.ts");

      codeFiles.push(componentCodeGenerator(
        destinationFile,
        this,
        def,
        this.includeZod,
      ));
    }

    for (const service of this.ir.services) {
      const serviceDir = this.getServiceDir(service);
      await fs.promises.mkdir(serviceDir, {
        recursive: true,
      });

      codeFiles.push(
        serviceCodeGenerator(
          this.getFilePath(service.serviceName),
          this,
          service,
          this.includeZod,
        ),
      );

      for (const endpoint of service.endpoints) {
        codeFiles.push(
          endpointCodeGenerator(
            this.getEndpointPath(service, endpoint),
            this,
            endpoint,
            this.includeZod,
          ),
        );
      }
    }

    await Promise.all(codeFiles.map(a => a()));
  }

  getPackageDir(fullPackage: string) {
    return path.join(
      this.#outDir,
      ...fullPackage.substring(this.#commonPackageBase.length).split("."),
    );
  }

  getShortPackage(fullPackage: string) {
    return fullPackage.substring(this.#commonPackageBase.length);
  }

  getFilePath(typeName: ConjureApi.ITypeName) {
    return this.resolvedFileForType.get(`${typeName.package}.${typeName.name}`)
      ?? `${path.join(this.getPackageDir(typeName.package), `${typeName.name}.ts`)}`;
  }

  getFilePathForImport(typeName: ConjureApi.ITypeName | string) {
    const withoutExt = typeof typeName === "string"
      ? path.join(path.dirname(typeName), path.basename(typeName, path.extname(typeName)))
      : (
        this.resolvedFileForType.get(`${typeName.package}.${typeName.name}`)?.slice(0, -3)
          ?? path.join(this.getPackageDir(typeName.package), `${typeName.name}`)
      );

    return this.includeExtensions ? withoutExt + ".js" : withoutExt;
  }

  getServiceDir(service: ConjureApi.IServiceDefinition) {
    return path.join(
      this.getPackageDir(service.serviceName.package),
      service.serviceName.name,
    );
  }

  getEndpointPath(
    service: ConjureApi.IServiceDefinition,
    endpoint: ConjureApi.IEndpointDefinition,
  ) {
    return `${
      path.join(
        this.getServiceDir(service),
        endpoint.endpointName,
      )
    }.ts`;
  }
}
