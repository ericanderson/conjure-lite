import { describe, expect, it } from "vitest";
import { Widget } from "./generated/widget/__components.js";

describe("Zod Schema Generation", () => {
  it("throw with bad data", async () => {
    expect(() =>
      Widget.parse({
        bad: "data",
      })
    ).toThrowErrorMatchingInlineSnapshot(`
      [ZodError: [
        {
          "expected": "boolean",
          "code": "invalid_type",
          "path": [
            "dash-separated"
          ],
          "message": "Invalid input: expected boolean, received undefined"
        },
        {
          "expected": "string",
          "code": "invalid_type",
          "path": [
            "description"
          ],
          "message": "Invalid input: expected string, received undefined"
        },
        {
          "code": "invalid_union",
          "errors": [
            [
              {
                "code": "invalid_value",
                "values": [
                  "FOO"
                ],
                "path": [],
                "message": "Invalid input: expected \\"FOO\\""
              }
            ],
            [
              {
                "code": "invalid_value",
                "values": [
                  "BAR"
                ],
                "path": [],
                "message": "Invalid input: expected \\"BAR\\""
              }
            ]
          ],
          "path": [
            "exampleEnum"
          ],
          "message": "Invalid input"
        }
      ]]
    `);
  });

  it("should parse valid data", async () => {
    const validData = {
      "dash-separated": true,
      description: "This is a valid description",
      exampleEnum: "FOO", // or "BAR"
    };
    expect(() => Widget.parse(validData)).not.toThrow();
    const parsed = Widget.parse(validData);
    expect(parsed).toEqual(validData);
  });
});
