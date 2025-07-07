import * as fs from "node:fs";
import * as path from "node:path";
import invariant from "tiny-invariant";
import { describe, expect, it } from "vitest";
import {
  external,
  field,
  list,
  map,
  primitive,
  reference,
  requireAlias,
  requireObject,
  stringType,
  typeName,
} from "./helpers.js";

const primitiveStringType = primitive("STRING");

describe("conjureYamlToIr", () => {
  it("should handle basics", async () => {
    const { conjureYamlToIrFromFile } = await import("./conjureYamlToIr.js");

    const __dirname = path.dirname(new URL(import.meta.url).pathname);

    const projectDir = path.join(__dirname, "..", "..");
    const yamlFilePath = path.join(projectDir, "artifacts-admin-api.yml");

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const expectedIr = JSON.parse(
      await fs.promises.readFile(path.join(projectDir, "artifacts-admin-api.conjure.json"), "utf8"),
    );
    const ir = conjureYamlToIrFromFile(yamlFilePath);
    expect(ir).toMatchObject(expectedIr);
  });

  it("should objects YAML to IR with x-tags", async () => {
    const { conjureYamlToIrFromFile } = await import("./conjureYamlToIr.js");

    const __dirname = path.dirname(new URL(import.meta.url).pathname);
    const xTagsFilePath = path.join(__dirname, "test-files", "x-tags-test.yml");

    const ir = conjureYamlToIrFromFile(xTagsFilePath);
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

  it("should handle conjure-imports (file references) and direct namespaces", async () => {
    const { conjureYamlToIrFromFile } = await import("./conjureYamlToIr.js");

    const __dirname = path.dirname(new URL(import.meta.url).pathname);
    const conjureImportsFilePath = path.join(__dirname, "test-files", "conjure-imports-test.yml");

    const ir = conjureYamlToIrFromFile(conjureImportsFilePath);

    // Check that namespaces are used directly (no alias resolution)
    expect(ir.errors).toHaveLength(2);
    expect(ir.errors[0].namespace).toBe("FirstNamespace");
    expect(ir.errors[1].namespace).toBe("SecondNamespace");

    // Check that endpoint errors have correct namespaces
    expect(ir.services).toHaveLength(1);
    expect(ir.services[0].endpoints).toHaveLength(1);
    expect(ir.services[0].endpoints[0].errors).toHaveLength(2);
    expect(ir.services[0].endpoints[0].errors[0].error.namespace).toBe(
      "FirstNamespace",
    );
    expect(ir.services[0].endpoints[0].errors[1].error.namespace).toBe("SecondNamespace");

    // Note: conjure-imports are stored but not currently processed (file loading not implemented)
    // This test verifies that conjure-imports don't interfere with namespace handling
  });

  it("should handle external type imports", async () => {
    const { conjureYamlToIrFromFile } = await import("./conjureYamlToIr.js");

    const __dirname = path.dirname(new URL(import.meta.url).pathname);
    const externalImportsFilePath = path.join(__dirname, "test-files", "external-imports-test.yml");

    const ir = conjureYamlToIrFromFile(externalImportsFilePath);

    // Should have one object type
    expect(ir.types).toHaveLength(1);

    const testObjectType = requireObject(ir.types, "TestObject", "com.palantir.test");
    const uuidType = external("java.util.UUID", stringType);
    const dateTimeType = external("com.external.library.DateTime", stringType);

    expect(testObjectType.object).toEqual({
      typeName: { name: "TestObject", package: "com.palantir.test" },
      fields: [
        field("id", uuidType),
        field("timestamp", dateTimeType),
        field("name", stringType),
        field("items", list(dateTimeType)),
        field("mapping", map(stringType, uuidType)),
      ],
    });
  });

  it("should handle conjure-imports with file loading", async () => {
    const { conjureYamlToIrFromFile } = await import("./conjureYamlToIr.js");

    const __dirname = path.dirname(new URL(import.meta.url).pathname);
    const exampleFilePath = path.join(__dirname, "test-files", "example.yml");

    const ir = conjureYamlToIrFromFile(exampleFilePath);

    // Should have types from both files
    expect(ir.types).toHaveLength(4); // ProductId (common), ProductInfo (common), ProductId (local), SomeRequest

    const typenameProductId = {
      name: "ProductId",
      package: "com.palantir.common",
    };

    const typenameProductInfo = {
      name: "ProductInfo",
      package: "com.palantir.common",
    };

    // Check ProductId (from common.yml)
    const productIdCommonType = requireAlias(ir.types, "ProductId", "com.palantir.common");
    expect(productIdCommonType.alias).toEqual({
      typeName: typenameProductId,
      alias: primitiveStringType,
      safety: undefined,
    });

    // Check local ProductId (from example.yml)
    const productIdLocalType = requireAlias(ir.types, "ProductId", "com.palantir.product");
    expect(productIdLocalType.alias).toEqual({
      typeName: {
        name: "ProductId",
        package: "com.palantir.product",
      },
      alias: primitive("INTEGER"),
      safety: undefined,
    });

    const productInfoType = requireObject(ir.types, "ProductInfo", "com.palantir.common");
    expect(productInfoType.object).toEqual({
      typeName: typenameProductInfo,
      fields: [
        field("id", reference("ProductId", "com.palantir.common")),
        field("name", primitive("STRING")),
        field("description", primitive("STRING")),
      ],
    });

    // Check SomeRequest (from example.yml) with imported types
    const someRequestType2 = requireObject(ir.types, "SomeRequest", "com.palantir.product");

    invariant(someRequestType2?.type === "object");
    expect(someRequestType2.object).toEqual({
      typeName: typeName("SomeRequest", "com.palantir.product"),
      fields: [
        field("productId", reference("ProductId", "com.palantir.common")),
        field("productInfo", reference("ProductInfo", "com.palantir.common")),
        field("quantity", primitive("INTEGER")),
      ],
    });
  });
});
