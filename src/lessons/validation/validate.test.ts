// @vitest-environment jsdom
import { describe, expect, test } from "vitest";
import { validateCheckpoints } from "./validate";

const FILES = {
  "/index.html": "<!DOCTYPE html><html><head></head><body><h1>Hi</h1></body></html>",
  "/style.css": "body { color: red; }",
};

const CHECKPOINTS = [
  {
    id: "has-head",
    label: "Add head",
    rule: { type: "element-exists" as const, selector: "head", file: "/index.html" },
  },
  {
    id: "has-h2",
    label: "Add h2",
    rule: { type: "element-exists" as const, selector: "h2", file: "/index.html" },
  },
  {
    id: "has-color",
    label: "Set color",
    rule: {
      type: "css-property" as const,
      selector: "body",
      file: "/style.css",
      property: "color",
      match: "exists" as const,
    },
  },
];

describe("validateCheckpoints", () => {
  test("returns results for each checkpoint", () => {
    const results = validateCheckpoints(CHECKPOINTS, FILES);
    expect(results).toHaveLength(3);
    expect(results.find((r) => r.checkpointId === "has-head")?.passed).toBe(true);
    expect(results.find((r) => r.checkpointId === "has-h2")?.passed).toBe(false);
    expect(results.find((r) => r.checkpointId === "has-color")?.passed).toBe(true);
  });
});
