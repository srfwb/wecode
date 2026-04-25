// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { highlightMatch } from "./highlightMatch";

describe("highlightMatch", () => {
  test("returns the raw text when the query is empty", () => {
    expect(highlightMatch("index.html", "")).toEqual(["index.html"]);
    expect(highlightMatch("index.html", "   ")).toEqual(["index.html"]);
  });

  test("returns the raw text when the query is not found", () => {
    expect(highlightMatch("index.html", "zzz")).toEqual(["index.html"]);
  });

  test("wraps the matched substring in a mark tag preserving original case", () => {
    const { container } = render(<span>{highlightMatch("INDEX.html", "ind")}</span>);
    const mark = container.querySelector("mark");
    expect(mark).toBeTruthy();
    expect(mark?.textContent).toBe("IND");
  });

  test("keeps prefix and suffix around the mark", () => {
    const { container } = render(<span>{highlightMatch("styles.css", "les")}</span>);
    expect(container.textContent).toBe("styles.css");
    expect(container.querySelector("mark")?.textContent).toBe("les");
  });

  test("matches only the first occurrence", () => {
    const { container } = render(<span>{highlightMatch("aaa-bbb-aaa", "aaa")}</span>);
    const marks = container.querySelectorAll("mark");
    expect(marks).toHaveLength(1);
    expect(marks[0]?.textContent).toBe("aaa");
  });
});
