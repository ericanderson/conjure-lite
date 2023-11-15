import type { IServiceDefinition } from "conjure-api";
import { generatorFactory } from "./generatorFactory.js";

export const serviceCodeGenerator = generatorFactory<IServiceDefinition>(
  async function() {
    const source = this.def.endpoints.map(e =>
      `export { ${e.endpointName} } from "${
        this.getImportModuleSpecifier(this.codeGen.getEndpointPath(this.def, e))
      }"`
    ).join("\n");

    await this.writeFile(source);
  },
);
