import type * as ConjureApi from "conjure-api";
import * as fs from "node:fs";
import * as path from "node:path";
import type { HandleGenerateArgs } from "../cli/HandleGenerateArgs.js";
import { findCommonPrefix } from "../util/findCommonPrefix.js";
import { endpointCodeGenerator } from "./EndpointCodeFile.js";
import { enumCodeGenerator } from "./EnumCodeFile.js";
import { objectCodeGenerator } from "./ObjectCodeFile.js";
import { packageIndexCodeGenerator } from "./PackageCodeFile.js";
import { serviceCodeGenerator } from "./ServiceCodeFile.js";
import { typeAliasCodeGenerator } from "./TypeAliasCodeFile.js";
import { unionCodeGenerator } from "./UnionCodeFile.js";

const typeGenerators = {
  object: objectCodeGenerator,
  alias: typeAliasCodeGenerator,
  enum: enumCodeGenerator,
  union: unionCodeGenerator,
} as const;

type UnionTypeInner_<Q extends { type: K }, K extends string> =
  (Q extends any ? (Q & { [KK in K]: KK extends keyof Q ? Q[KK] : never })
    : "wm[")[K];
type UnionTypeInner<Q extends { type: string }> = UnionTypeInner_<Q, Q["type"]>;

function drillIntoUnion<Q extends { type: string }>(
  conjureUnion: Q,
): UnionTypeInner<Q> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return (conjureUnion as any)[conjureUnion.type] as UnionTypeInner<Q>;
}

export class CodeGen {
  #outDir: string;
  ir: ConjureApi.IConjureDefinition;
  #commonPackageBase: string;
  packages: Set<string>;
  header: string;

  readonly includeExtensions: boolean;

  constructor(ir: ConjureApi.IConjureDefinition, args: HandleGenerateArgs) {
    this.ir = ir;
    this.#outDir = args.outDir;
    this.includeExtensions = args.includeExtensions;
    this.header = args.header ?? "";

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
        }),
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

    for (const type of this.ir.types) {
      // Typescript does not express this situation well
      // `type[type.type]` is the value portion of the enum
      const valuePortion = drillIntoUnion(type);

      codeFiles.push(typeGenerators[type.type](
        this.getFilePath(valuePortion.typeName),
        this,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        valuePortion as any,
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
        ),
      );

      for (const endpoint of service.endpoints) {
        codeFiles.push(
          endpointCodeGenerator(this.getEndpointPath(service, endpoint), this, endpoint),
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
    return `${path.join(this.getPackageDir(typeName.package), `${typeName.name}.ts`)}`;
  }

  getFilePathForImport(typeName: ConjureApi.ITypeName | string) {
    const withoutExt = typeof typeName === "string"
      ? path.join(path.dirname(typeName), path.basename(typeName, path.extname(typeName)))
      : path.join(this.getPackageDir(typeName.package), `${typeName.name}`);

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
