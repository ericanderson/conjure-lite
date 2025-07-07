import type { IServiceDefinition } from "conjure-api";
import { generatorFactory } from "./generatorFactory.js";

export const serviceCodeGenerator = generatorFactory<IServiceDefinition>(
  async function() {
    let source = "";
    for (const def of this.defs) {
      source += def.endpoints.map(e =>
        `export { ${e.endpointName} } from "${
          this.getImportModuleSpecifier(this.codeGen.getEndpointPath(def, e))
        }"`
      ).join("\n");
    }

    await this.writeFile(source);
  },
);
