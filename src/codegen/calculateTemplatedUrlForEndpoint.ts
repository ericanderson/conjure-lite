import type { IArgumentDefinition, IEndpointDefinition, IParameterType_Query } from "conjure-api";

export function calculateTemplatedUrlForEndpoint(endpoint: IEndpointDefinition) {
  const queryArgs = endpoint.args.filter(isQueryArgument);
  const queryPortion = queryArgs.length === 0
    ? ""
    : "?${" + `new URLSearchParams({ ${
      queryArgs.map(a => {
        // a.type.type === "primitive"  && a.type.primitive === ""
        switch (a.type.type) {
          case "list":
          case "map":
          case "reference":
          case "set":
            throw new Error(
              `Unsupported type ${a.type.type} while generating ${endpoint.endpointName}`,
            );

          case "primitive":
            switch (a.type.primitive) {
              case "STRING":
              case "BEARERTOKEN":
              case "RID":
              case "UUID":
                return `"${a.paramType.query.paramId}": ${a.argName}`;
            }
        }

        return `"${a.paramType.query.paramId}": "" + ${a.argName}`;
      }).join(",")
    } })` + "}";

  return "`" + endpoint.args.reduce(
    (p, c) => {
      if (c.paramType.type === "path") {
        return p.replace(`{${c.argName}}`, `\${${c.argName}}`);
      }
      return p;
    },
    endpoint.httpPath,
  ) + queryPortion + "`";
}

function isQueryArgument(
  a: IArgumentDefinition,
): a is IArgumentDefinition & { paramType: IParameterType_Query } {
  return a.paramType.type === "query";
}
