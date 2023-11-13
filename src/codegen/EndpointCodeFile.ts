import * as ConjureApi from "conjure-api";
import { BaseFileGenerator } from "./BaseFileGenerator.js";
import { calculateTemplatedUrlForEndpoint } from "./calculateTemplatedUrlForEndpoint.js";
import { CodeGen } from "./CodeGen.js";

export class EndpointCodeFile extends BaseFileGenerator {
  #service: ConjureApi.IServiceDefinition;
  #endpoint: ConjureApi.IEndpointDefinition;

  constructor(
    filePath: string,
    codeGen: CodeGen,
    service: ConjureApi.IServiceDefinition,
    endpoint: ConjureApi.IEndpointDefinition,
  ) {
    super(filePath, codeGen);
    this.#service = service;
    this.#endpoint = endpoint;
  }

  async generate() {
    let endpointSource = "";

    const templatedUrl = calculateTemplatedUrlForEndpoint(this.#endpoint);

    for (const q of this.#endpoint.args) {
      endpointSource += this.ensureImportForType(q.type);
    }
    if (this.#endpoint.returns) {
      this.ensureImportForType(this.#endpoint.returns);
    }

    const bodyArg = this.#endpoint.args.find(a => a.paramType.type === "body");
    const bodyArgContentType = getContentType(bodyArg?.type);

    const acceptContentType = getContentType(this.#endpoint.returns);

    this.imports.set("#marker", `import {conjureFetch, type ConjureContext} from "conjure-lite"`);

    const args = [
      "ctx",
      templatedUrl,
      `"${this.#endpoint.httpMethod}"`,
      bodyArg?.argName,
      bodyArgContentType === "application/json" ? undefined : bodyArgContentType,
      acceptContentType === "application/json" ? undefined : acceptContentType,
    ];
    for (let i = args.length - 1; i >= 0; i--) {
      if (args[i] === undefined) {
        args.pop();
      } else {
        break;
      }
    }

    const functionSource = `
        export async function ${this.#endpoint.endpointName}(ctx: ConjureContext, ${
      this.#endpoint.args.map(a => `${a.argName}: ${this.getTypeForCode(a.type)}`)
    }): Promise<${this.#endpoint.returns ? this.getTypeForCode(this.#endpoint.returns) : "void"}> {
          return conjureFetch(${args.join(",")})
        }
    `;

    await this.writeFile(functionSource);
  }
}

export function getContentType(arg: ConjureApi.IType | undefined | null) {
  return (arg
      && (isBinary(arg)
        || (arg.type === "optional" && isBinary(arg.optional.itemType))))
    ? "application/octet-stream"
    : "application/json";
}

function isBinary(type: ConjureApi.IType) {
  return type.type === "primitive" && type.primitive === "BINARY";
}
