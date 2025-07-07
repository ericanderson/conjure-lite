import { readFileSync } from "fs";
import { packageDirectory } from "package-directory";
import { join } from "path";
import invariant from "tiny-invariant";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { ConjureSourceFile } from "./index.js";

describe("BasicConjure", () => {
  it("should successfully parse and validate conjure-api.yml", async () => {
    // Read the conjure-api.yml file
    const packageDir = await packageDirectory({
      cwd: __dirname,
    });
    const yamlFilePath = join(packageDir!, "conjure-api.yml");
    const yamlContent = readFileSync(yamlFilePath, "utf-8");

    // Parse YAML content
    const parsedYaml: unknown = parse(yamlContent);

    // Validate against ConjureSourceFile schema
    const result = ConjureSourceFile.safeParse(parsedYaml);

    // Assert validation succeeds
    expect(result.success).toBe(true);

    if (result.success) {
      const data = result.data;

      // Verify the basic structure
      expect(data).toHaveProperty("types");
      expect(data.types).toHaveProperty("definitions");
      invariant(data.types?.definitions);
      expect(data.types.definitions).toHaveProperty("default-package");
      expect(data.types.definitions["default-package"]).toBe("com.palantir.conjure.spec");

      // Verify objects are present
      expect(data.types.definitions).toHaveProperty("objects");
      const objects = data.types.definitions.objects;
      invariant(objects);

      // Check for key object types
      expect(objects).toHaveProperty("ConjureDefinition");
      expect(objects).toHaveProperty("TypeName");
      expect(objects).toHaveProperty("LogSafety");
      expect(objects).toHaveProperty("ErrorDefinition");
      expect(objects).toHaveProperty("ServiceDefinition");

      // Verify ConjureDefinition structure
      const conjureDefinition = objects.ConjureDefinition;

      expect(conjureDefinition).toHaveProperty("fields");
      invariant("fields" in conjureDefinition);
      expect(conjureDefinition.fields).toHaveProperty("version");
      expect(conjureDefinition.fields).toHaveProperty("errors");
      expect(conjureDefinition.fields).toHaveProperty("types");
      expect(conjureDefinition.fields).toHaveProperty("services");

      // Verify TypeName structure
      const typeName = objects.TypeName;
      expect(typeName).toHaveProperty("fields");
      invariant("fields" in typeName);
      expect(typeName.fields).toHaveProperty("name");
      expect(typeName.fields).toHaveProperty("package");

      // Verify LogSafety enum
      const logSafety = objects.LogSafety;
      expect(logSafety).toHaveProperty("values");
      invariant("values" in logSafety);

      expect(logSafety.values[0]).toEqual(expect.objectContaining({ value: "SAFE" }));
      expect(logSafety.values[1]).toEqual(expect.objectContaining({ value: "UNSAFE" }));
      expect(logSafety.values[2]).toEqual(expect.objectContaining({ value: "DO_NOT_LOG" }));

      // Verify ErrorCode enum
      const errorCode = objects.ErrorCode;
      expect(errorCode).toHaveProperty("values");
      invariant("values" in errorCode);
      expect(errorCode.values).toContain("PERMISSION_DENIED");
      expect(errorCode.values).toContain("INVALID_ARGUMENT");
      expect(errorCode.values).toContain("NOT_FOUND");

      // Verify union types
      const type = objects.Type;
      expect(type).toHaveProperty("union");
      invariant("union" in type);
      expect(type.union).toHaveProperty("primitive");
      expect(type.union).toHaveProperty("optional");
      expect(type.union).toHaveProperty("list");
      expect(type.union).toHaveProperty("reference");

      // Verify service-related types
      const serviceDefinition = objects.ServiceDefinition;
      expect(serviceDefinition).toHaveProperty("fields");
      invariant("fields" in serviceDefinition);
      expect(serviceDefinition.fields).toHaveProperty("serviceName");
      expect(serviceDefinition.fields).toHaveProperty("endpoints");

      const endpointDefinition = objects.EndpointDefinition;
      expect(endpointDefinition).toHaveProperty("fields");
      invariant("fields" in endpointDefinition);
      expect(endpointDefinition.fields).toHaveProperty("httpMethod");
      expect(endpointDefinition.fields).toHaveProperty("httpPath");

      // Test specific field validation
      invariant(typeof typeName.fields.name !== "string");
      expect(typeName.fields.name).toHaveProperty("type", "string");
      expect(typeName.fields.package).toHaveProperty("type", "string");
    }
  });

  it("should handle error cases gracefully", () => {
    // Test with invalid YAML structure
    const invalidData = {
      types: {
        definitions: {
          "default-package": 123, // Invalid type, should be string
          objects: {},
        },
      },
    };

    const result = ConjureSourceFile.safeParse(invalidData);
    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error).toBeDefined();
      expect(result.error.issues).toBeDefined();
      expect(result.error.issues.length).toBeGreaterThan(0);
    }
  });
});
