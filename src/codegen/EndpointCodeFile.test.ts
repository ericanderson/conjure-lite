import type { IConjureDefinition, IEndpointDefinition } from "conjure-api";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { CodeGen } from "./CodeGen.js";
import { endpointCodeGenerator } from "./EndpointCodeFile.js";

const BASE_PACKAGE = "com.foo";

const MINIMAL_CONJURE_DEF = {
  version: 1,
  errors: [],
  types: [
    unionEntry("object", {
      fields: [],
      typeName: {
        name: "Placeholder", // just to register the BASE_PACKAGE
        package: BASE_PACKAGE,
      },
    }),
  ],
  extensions: [],
  services: [],
} satisfies IConjureDefinition;

function unionEntry<K extends string, B>(k: K, b: B): { type: K } & Record<K, B> {
  return {
    type: k,
    [k]: b,
  } as { type: K } & Record<K, B>;
}

function makeEndpoint<K extends Exclude<keyof IEndpointDefinition, "endpointName" | "httpPath">>(
  endpointName: string,
  extra: Pick<IEndpointDefinition, K | "args" | "returns">,
) {
  return {
    endpointName,
    httpMethod: "POST" as const,
    httpPath: `/${endpointName}`,
    markers: [],
    tags: [],
    ...extra,
  };
}

describe(endpointCodeGenerator, () => {
  it("should properly generate mime types for return type BINARY", async () => {
    const osTmpdir = os.tmpdir();
    const tmpdir = await fs.mkdtemp(path.join(osTmpdir, "conjure-lite-"));

    const codegen = new CodeGen(MINIMAL_CONJURE_DEF, {
      includeExtensions: true,
      outDir: tmpdir,
      ir: "wat",
    });

    await endpointCodeGenerator(
      path.join(tmpdir, "foo.ts"),
      codegen,
      makeEndpoint("returnsBinary", {
        args: [
          {
            argName: "request",
            type: unionEntry("reference", {
              name: "SomeRequest",
              package: `${BASE_PACKAGE}.api`,
            }),
            paramType: unionEntry("body", {}),
            markers: [],
            tags: [],
          },
        ],
        returns: unionEntry("primitive", "BINARY"),
        errors: [],
      }),
    )();

    const contents = await fs.readFile(path.join(tmpdir, "foo.ts"), "utf-8");

    expect(contents).toMatchInlineSnapshot(`
      "import { conjureFetch, type ConjureContext } from "conjure-lite"
      import type { SomeRequest } from "./api/SomeRequest.js";
      export async function returnsBinary(ctx: ConjureContext, request: SomeRequest): Promise<Blob> {
        return conjureFetch(ctx, \`/returnsBinary\`, "POST", request, undefined, undefined, "application/octet-stream")
      }"
    `);
  });

  it("should properly generate mime types for return type BINARY", async () => {
    const osTmpdir = os.tmpdir();
    const tmpdir = await fs.mkdtemp(path.join(osTmpdir, "conjure-lite-"));

    const codegen = new CodeGen(MINIMAL_CONJURE_DEF, {
      includeExtensions: true,
      outDir: tmpdir,
      ir: "wat",
    });

    await endpointCodeGenerator(
      path.join(tmpdir, "foo.ts"),
      codegen,
      makeEndpoint("returnsBinary", {
        args: [
          {
            argName: "request",
            type: unionEntry("primitive", "BINARY"),
            paramType: unionEntry("body", {}),
            markers: [],
            tags: [],
          },
        ],
        returns: unionEntry("primitive", "STRING"),
        errors: [],
      }),
    )();

    const contents = await fs.readFile(path.join(tmpdir, "foo.ts"), "utf-8");

    expect(contents).toMatchInlineSnapshot(`
      "import { conjureFetch, type ConjureContext } from "conjure-lite"
      export async function returnsBinary(ctx: ConjureContext, request: Blob): Promise<string> {
        return conjureFetch(ctx, \`/returnsBinary\`, "POST", request, undefined, "application/octet-stream")
      }"
    `);
  });

  it("should drop params that are undefined", async () => {
    const osTmpdir = os.tmpdir();
    const tmpdir = await fs.mkdtemp(path.join(osTmpdir, "conjure-lite-"));

    const codegen = new CodeGen(MINIMAL_CONJURE_DEF, {
      includeExtensions: true,
      outDir: tmpdir,
      ir: "wat",
    });

    await endpointCodeGenerator(
      path.join(tmpdir, "foo.ts"),
      codegen,
      makeEndpoint("returnsString", {
        args: [
          {
            argName: "request",
            type: unionEntry("primitive", "STRING"),
            paramType: unionEntry("body", {}),
            markers: [],
            tags: [],
          },
        ],
        returns: unionEntry("primitive", "STRING"),
        errors: [],
      }),
    )();

    const contents = await fs.readFile(path.join(tmpdir, "foo.ts"), "utf-8");

    expect(contents).toMatchInlineSnapshot(`
      "import { conjureFetch, type ConjureContext } from "conjure-lite"
      export async function returnsString(ctx: ConjureContext, request: string): Promise<string> {
        return conjureFetch(ctx, \`/returnsString\`, "POST", request)
      }"
    `);
  });
});
