import type { IServiceDefinition, ITypeName } from "conjure-api";
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

    const getTypeExport = (typeName: ITypeName) => {
      const qualifier = this.getImportModuleSpecifier(
        this.codeGen.getFilePathForImport(typeName),
      );
      return `export type { ${typeName.name} } from "${qualifier}";`;
    };

    const services = this.codeGen.ir.services.filter(s =>
      s.serviceName.package == this.def.packageName
    );

    const types = this.codeGen.ir.types.map(t => spreadIntoTypes(t).typeName).filter(t =>
      t.package === this.def.packageName
    );

    const childPackages = Array.from(this.codeGen.packages).filter(p =>
      p.startsWith(`${this.def.packageName}.`)
    ).map(p => p.substring(this.def.packageName.length + 1).split(".")[0]);

    const source = services.map(getServiceExport).join("\n") + "\n\n"
      + types.map(getTypeExport).join("\n") + "\n\n"
      + childPackages.map(p =>
        `export * as ${p} from "./${p}/index${this.codeGen.includeExtensions ? ".js" : ""}"`
      ).join("\n");

    await this.writeFile(source);
  },
);
