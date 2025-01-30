import type { IServiceDefinition } from "conjure-api";
import { generatorFactory } from "./generatorFactory.js";
import { spreadIntoTypes } from "./spreadIntoTypes.js";

export const packageIndexCodeGenerator = generatorFactory<
  { packageName: string }
>(
  async function() {
    const getServiceExport = ({ serviceName }: IServiceDefinition) => {
      const qualifier = this.getImportModuleSpecifier(
        this.codeGen.getFilePathForImport(serviceName),
      );
      return `export * as ${serviceName.name} from "${qualifier}";`;
    };

    let source = "";
    for (const def of this.defs) {
      const services = this.codeGen.ir.services.filter(s =>
        s.serviceName.package == def.packageName
      );

      const types = this.codeGen.ir.types.map(t => spreadIntoTypes(t)).filter(t =>
        t.typeName.package === def.packageName
      );

      const packageExports = types.length === 0
        ? ""
        : `export type {${types.map(t => t.typeName.name).join(", ")}} from "./__components.js";`;

      const childPackagesSet = new Set<string>();
      this.codeGen.packages.forEach(p => {
        if (p.startsWith(`${def.packageName}.`)) {
          const childPackage = p.substring(def.packageName.length + 1).split(".")[0];
          childPackagesSet.add(childPackage);
        }
      });

      const childPackages = Array.from(childPackagesSet);
      source += services.map(getServiceExport).join("\n") + "\n\n"
        + packageExports + "\n\n"
        + childPackages.map(p =>
          `export * as ${p} from "./${p}/index${this.codeGen.includeExtensions ? ".js" : ""}"`
        ).join("\n");
    }

    await this.writeFile(source);
  },
);
