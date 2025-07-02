import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

describe("conjureYamlToIr", () => {
  it("should handle basics", async () => {
    const { conjureYamlToIr } = await import("./conjureYamlToIr.js");

    const __dirname = path.dirname(new URL(import.meta.url).pathname);

    const projectDir = path.join(__dirname, "..", "..");

    const yaml = await fs.promises.readFile(
      path.join(projectDir, "artifacts-admin-api.yml"),
      "utf8",
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const expectedIr = JSON.parse(
      await fs.promises.readFile(path.join(projectDir, "artifacts-admin-api.conjure.json"), "utf8"),
    );
    const ir = conjureYamlToIr(yaml);
    expect(ir).toMatchObject(expectedIr);
  });

  it("should objects YAML to IR with x-tags", async () => {
    const { conjureYamlToIr } = await import("./conjureYamlToIr.js");
    const yaml = `
types:
  definitions:
    default-package: com.palantir.conjure.spec
    objects:
      TypeName:
        x-tags:
          a: "b"
        fields:
          name:
            type: string
            x-tags:
              c: "d"
            docs: >
              The name of the custom Conjure type or service. It must be in UpperCamelCase. Numbers are permitted, but
              not at the beginning of a word. Allowed names: "FooBar", "XYCoordinate", "Build2Request". Disallowed names:
              "fooBar", "2BuildRequest".
          package:
            type: string
            docs: >
              A period-delimited string of package names. The package names must be lowercase. Numbers are permitted, but
              not at the beginning of a package name. Allowed packages: "foo", "com.palantir.bar",
              "com.palantir.foo.thing2". Disallowed packages: "Foo", "com.palantir.foo.2thing".
        
        `;
    const ir = conjureYamlToIr(yaml);
    expect(ir).toMatchInlineSnapshot(`
      {
        "errors": [],
        "extensions": {
          "recommended-product-dependencies": [],
          "x-tags": {
            "errors": {},
            "types": {
              "TypeName": {
                "fields": {
                  "name": {
                    "c": "d",
                  },
                },
                "object": {
                  "a": "b",
                },
              },
            },
          },
        },
        "services": [],
        "types": [
          {
            "object": {
              "fields": [
                {
                  "docs": "The name of the custom Conjure type or service. It must be in UpperCamelCase. Numbers are permitted, but not at the beginning of a word. Allowed names: "FooBar", "XYCoordinate", "Build2Request". Disallowed names: "fooBar", "2BuildRequest".
      ",
                  "fieldName": "name",
                  "type": {
                    "primitive": "STRING",
                    "type": "primitive",
                  },
                },
                {
                  "docs": "A period-delimited string of package names. The package names must be lowercase. Numbers are permitted, but not at the beginning of a package name. Allowed packages: "foo", "com.palantir.bar", "com.palantir.foo.thing2". Disallowed packages: "Foo", "com.palantir.foo.2thing".
      ",
                  "fieldName": "package",
                  "type": {
                    "primitive": "STRING",
                    "type": "primitive",
                  },
                },
              ],
              "typeName": {
                "name": "TypeName",
                "package": "com.palantir.conjure.spec",
              },
            },
            "type": "object",
          },
        ],
        "version": 1,
      }
    `);
  });
});
