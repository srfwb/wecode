import { describe, expect, test } from "vitest";
import type { ValidationRule } from "./types";

describe("ValidationRule types", () => {
  test("element-exists rule is well-typed", () => {
    const rule: ValidationRule = { type: "element-exists", selector: "h1", file: "/index.html" };
    expect(rule.type).toBe("element-exists");
  });

  test("composite rule accepts nested rules", () => {
    const rule: ValidationRule = {
      type: "composite",
      operator: "and",
      rules: [
        { type: "element-exists", selector: "h1", file: "/index.html" },
        { type: "file-contains", file: "/index.html", text: "<h1>" },
      ],
    };
    expect(rule.rules).toHaveLength(2);
  });
});
