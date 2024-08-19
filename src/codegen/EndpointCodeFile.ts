import type {
  IArgumentDefinition,
  IEndpointDefinition,
  IParameterType_Query,
  IType,
} from "conjure-api";
import dedent from "dedent";
import { calculateTemplatedUrlForEndpoint } from "./calculateTemplatedUrlForEndpoint.js";
import { generatorFactory } from "./generatorFactory.js";
import { getDocs } from "./getDocs.js";

export const endpointCodeGenerator = generatorFactory<IEndpointDefinition>(
  async function() {
    const templatedUrl = calculateTemplatedUrlForEndpoint(this.def);

    const bodyArg = (this.def.args ?? []).find(a => a.paramType.type === "body");
    const bodyArgContentType = getContentType(bodyArg?.type);

    const queryParams = (this.def.args ?? []).filter(isQueryArgument);
    const queryArg = queryParams.length === 0 ? undefined : `{ ${
      queryParams.map(a => {
        if (a.type.type === "map") {
          throw new Error(
            `Unsupported type ${a.type.type} while generating ${this.def.endpointName}`,
          );
        }
        return a.paramType.query.paramId === a.argName
          ? a.paramType.query.paramId
          : `"${a.paramType.query.paramId}": ${a.argName}`;
      }).join(",")
    } }`;

    const acceptContentType = getContentType(this.def.returns);

    this.imports.set(
      "conjure-lite",
      `import { conjureFetch, type ConjureContext } from "conjure-lite"`,
    );

    const conjureFetchArgs = [
      "ctx",
      templatedUrl,
      `"${this.def.httpMethod}"`,
      bodyArg?.argName ?? "undefined",
      queryArg ?? "undefined",
      bodyArgContentType === "application/json" ? "undefined" : `"${bodyArgContentType}"`,
      acceptContentType === "application/json" ? "undefined" : `"${acceptContentType}"`,
    ];
    for (let i = conjureFetchArgs.length - 1; i >= 0; i--) {
      if (conjureFetchArgs[i] === "undefined") {
        conjureFetchArgs.pop();
      } else {
        break;
      }
    }

    const functionSource = getDocs(this.def.docs) + dedent`
      export async function ${this.def.endpointName}(ctx: ConjureContext, ${
      (this.def.args ?? []).map(a => `${a.argName}: ${this.getTypeForCode(a.type)}`).join(`, `)
    }): Promise<${this.def.returns ? this.getTypeForCode(this.def.returns) : "void"}> {
        return conjureFetch(${conjureFetchArgs.join(", ")})
      }
  `;

    await this.writeFile(functionSource);
  },
);

export function getContentType(arg: IType | undefined | null) {
  return (arg
      && (isBinary(arg)
        || (arg.type === "optional" && isBinary(arg.optional.itemType))))
    ? "application/octet-stream"
    : "application/json";
}

function isBinary(type: IType) {
  return type.type === "primitive" && type.primitive === "BINARY";
}

function isQueryArgument(
  a: IArgumentDefinition,
): a is IArgumentDefinition & { paramType: IParameterType_Query } {
  return a.paramType.type === "query";
}
