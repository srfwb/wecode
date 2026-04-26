import type { ValidationRule } from "../types";
import { checkElementExists } from "./elementExists";
import { checkFileContains, checkFileNotContains } from "./fileContains";
import { checkCssProperty } from "./cssProperty";
import { checkNesting } from "./nesting";

export function evaluateRule(rule: ValidationRule, files: Record<string, string>): boolean {
  switch (rule.type) {
    case "element-exists":
      return checkElementExists(rule, files);
    case "file-contains":
      return checkFileContains(rule, files);
    case "file-not-contains":
      return checkFileNotContains(rule, files);
    case "css-property":
      return checkCssProperty(rule, files);
    case "nesting":
      return checkNesting(rule, files);
    case "composite":
      return checkComposite(rule, files);
    default:
      return false;
  }
}

export function checkComposite(
  rule: { type: "composite"; operator: "and" | "or"; rules: ValidationRule[] },
  files: Record<string, string>,
): boolean {
  if (rule.operator === "and") return rule.rules.every((r) => evaluateRule(r, files));
  return rule.rules.some((r) => evaluateRule(r, files));
}
