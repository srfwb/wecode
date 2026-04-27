// @vitest-environment jsdom
import { describe, expect, test } from "vitest";

import { checkElementExists } from "./elementExists";
import { checkFileContains, checkFileNotContains } from "./fileContains";
import { checkCssProperty } from "./cssProperty";
import { checkNesting } from "./nesting";
import { checkComposite } from "./composite";

const HTML = `<!DOCTYPE html><html><head><title>Test</title></head><body><h1 class="title">Hello</h1><p>World</p></body></html>`;
const CSS = `body { background-color: red; font-size: 16px; }\n.title { color: blue; }`;
const FILES: Record<string, string> = { "/index.html": HTML, "/style.css": CSS };

describe("elementExists", () => {
  test("passes when selector matches", () => {
    expect(
      checkElementExists({ type: "element-exists", selector: "h1", file: "/index.html" }, FILES),
    ).toBe(true);
  });
  test("fails when selector does not match", () => {
    expect(
      checkElementExists({ type: "element-exists", selector: "h2", file: "/index.html" }, FILES),
    ).toBe(false);
  });
  test("fails when file is missing", () => {
    expect(
      checkElementExists({ type: "element-exists", selector: "h1", file: "/missing.html" }, FILES),
    ).toBe(false);
  });
});

describe("fileContains", () => {
  test("passes when text is present", () => {
    expect(
      checkFileContains(
        { type: "file-contains", file: "/style.css", text: "background-color" },
        FILES,
      ),
    ).toBe(true);
  });
  test("fails when text is absent", () => {
    expect(
      checkFileContains(
        { type: "file-contains", file: "/style.css", text: "display: flex" },
        FILES,
      ),
    ).toBe(false);
  });
});

describe("fileNotContains", () => {
  test("passes when text is absent", () => {
    expect(
      checkFileNotContains(
        { type: "file-not-contains", file: "/index.html", text: "<br><br>" },
        FILES,
      ),
    ).toBe(true);
  });
  test("fails when text is present", () => {
    expect(
      checkFileNotContains({ type: "file-not-contains", file: "/index.html", text: "<h1" }, FILES),
    ).toBe(false);
  });
});

describe("cssProperty", () => {
  test("passes when selector has the property", () => {
    expect(
      checkCssProperty(
        {
          type: "css-property",
          selector: "body",
          file: "/style.css",
          property: "background-color",
          match: "exists",
        },
        FILES,
      ),
    ).toBe(true);
  });
  test("fails when property is missing", () => {
    expect(
      checkCssProperty(
        {
          type: "css-property",
          selector: "body",
          file: "/style.css",
          property: "display",
          match: "exists",
        },
        FILES,
      ),
    ).toBe(false);
  });
  test("fails when selector is missing", () => {
    expect(
      checkCssProperty(
        {
          type: "css-property",
          selector: ".missing",
          file: "/style.css",
          property: "color",
          match: "exists",
        },
        FILES,
      ),
    ).toBe(false);
  });
});

describe("nesting", () => {
  test("passes when child is inside parent", () => {
    expect(
      checkNesting({ type: "nesting", parent: "body", child: "h1", file: "/index.html" }, FILES),
    ).toBe(true);
  });
  test("fails when child is not inside parent", () => {
    expect(
      checkNesting({ type: "nesting", parent: "h1", child: "p", file: "/index.html" }, FILES),
    ).toBe(false);
  });
  test("direct child check", () => {
    expect(
      checkNesting(
        { type: "nesting", parent: "body", child: "h1", direct: true, file: "/index.html" },
        FILES,
      ),
    ).toBe(true);
    expect(
      checkNesting(
        { type: "nesting", parent: "html", child: "h1", direct: true, file: "/index.html" },
        FILES,
      ),
    ).toBe(false);
  });
});

describe("composite", () => {
  test("AND passes when all sub-rules pass", () => {
    expect(
      checkComposite(
        {
          type: "composite",
          operator: "and",
          rules: [
            { type: "element-exists", selector: "h1", file: "/index.html" },
            { type: "file-contains", file: "/style.css", text: "body" },
          ],
        },
        FILES,
      ),
    ).toBe(true);
  });
  test("AND fails when one sub-rule fails", () => {
    expect(
      checkComposite(
        {
          type: "composite",
          operator: "and",
          rules: [
            { type: "element-exists", selector: "h1", file: "/index.html" },
            { type: "element-exists", selector: "h99", file: "/index.html" },
          ],
        },
        FILES,
      ),
    ).toBe(false);
  });
  test("OR passes when any sub-rule passes", () => {
    expect(
      checkComposite(
        {
          type: "composite",
          operator: "or",
          rules: [
            { type: "element-exists", selector: "h99", file: "/index.html" },
            { type: "element-exists", selector: "h1", file: "/index.html" },
          ],
        },
        FILES,
      ),
    ).toBe(true);
  });
});
