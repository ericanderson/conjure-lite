import { describe, expect, it } from "vitest";
import { TypeName } from "./index.js";

describe("TypeName", () => {
  describe("valid type names", () => {
    it("should parse simple PascalCase type names", () => {
      const validNames = [
        "Bar",
        "FooBar",
        "MyType",
        "A",
        "Type123",
        "MyType456",
      ];

      for (const name of validNames) {
        const result = TypeName.safeParse(name);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe(name);
        }
      }
    });

    it("should parse package-qualified type names", () => {
      const validNames = [
        "foo.Bar",
        "other.MyType",
        "a.B",
        "package123.Type456",
      ];

      for (const name of validNames) {
        const result = TypeName.safeParse(name);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe(name);
        }
      }
    });
  });

  describe("invalid type names", () => {
    it("should reject type names with multiple package levels", () => {
      const invalidNames = [
        "bar.bar.Bar",
        "com.example.MyType",
        "com.example.package.MyType",
        "a.b.c.Type",
        "foo.bar.baz.MyType",
      ];

      for (const name of invalidNames) {
        const result = TypeName.safeParse(name);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe("Type names must be in PascalCase");
        }
      }
    });

    it("should reject type names not starting with uppercase letter", () => {
      const invalidNames = [
        "bar",
        "myType",
        "foo.bar",
        "package.myType",
        "123Type",
        "foo.123Type",
      ];

      for (const name of invalidNames) {
        const result = TypeName.safeParse(name);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe("Type names must be in PascalCase");
        }
      }
    });

    it("should reject type names with invalid characters", () => {
      const invalidNames = [
        "My-Type",
        "My_Type",
        "My Type",
        "My.Type.With-Dash",
        "foo.My_Type",
        "package$.Type",
        "foo.Bar!",
      ];

      for (const name of invalidNames) {
        const result = TypeName.safeParse(name);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe("Type names must be in PascalCase");
        }
      }
    });

    it("should reject empty strings and invalid formats", () => {
      const invalidNames = [
        "",
        ".",
        ".Bar",
        "foo.",
        ".foo.Bar",
        "foo..Bar",
      ];

      for (const name of invalidNames) {
        const result = TypeName.safeParse(name);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe("Type names must be in PascalCase");
        }
      }
    });
  });

  describe("specific test cases from requirements", () => {
    it("should parse 'foo.Bar'", () => {
      const result = TypeName.safeParse("foo.Bar");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("foo.Bar");
      }
    });

    it("should parse 'Bar'", () => {
      const result = TypeName.safeParse("Bar");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("Bar");
      }
    });

    it("should NOT parse 'bar.bar.Bar'", () => {
      const result = TypeName.safeParse("bar.bar.Bar");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Type names must be in PascalCase");
      }
    });
  });
});
