import { describe, expect, it } from "vitest";

import { getTemplate, TEMPLATES } from "./templates";

describe("templates registry", () => {
  it("ships blank and html-css", () => {
    const ids = TEMPLATES.map((t) => t.id).sort();
    expect(ids).toEqual(["blank", "html-css"]);
  });

  it("blank template has no files", () => {
    const blank = getTemplate("blank");
    expect(Object.keys(blank.files)).toHaveLength(0);
  });

  it("html-css template seeds index.html and style.css", () => {
    const template = getTemplate("html-css");
    expect(Object.keys(template.files).sort()).toEqual(["/index.html", "/style.css"]);
  });

  it("getTemplate throws on unknown id", () => {
    // @ts-expect-error — intentional wrong id
    expect(() => getTemplate("missing")).toThrow(/unknown template/);
  });
});
