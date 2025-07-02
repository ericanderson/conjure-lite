import type { IEndpointDefinition } from "conjure-api";

export function calculateTemplatedUrlForEndpoint(endpoint: IEndpointDefinition) {
  const args = endpoint.args ?? [];
  return "`" + args.reduce(
    (p, c) => {
      if (c.paramType.type === "path") {
        return p.replace(`{${c.argName}}`, `\${${c.argName}}`);
      }
      return p;
    },
    endpoint.httpPath,
  ) + "`";
}
