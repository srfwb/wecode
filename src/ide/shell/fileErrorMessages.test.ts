import { describe, expect, test } from "vitest";

import { localizeFileError } from "./fileErrorMessages";

describe("localizeFileError", () => {
  test("translates forbidden-character errors", () => {
    expect(localizeFileError(new Error("forbidden character in segment: foo|bar"))).toContain(
      "forbidden character",
    );
  });

  test("translates invalid path segment errors", () => {
    expect(localizeFileError(new Error('invalid path segment "."'))).toContain('"." or ".."');
  });

  test("translates already-exists errors", () => {
    expect(localizeFileError(new Error("file already exists"))).toContain(
      "A file with that name already exists",
    );
  });

  test("translates rename-directory refusal", () => {
    expect(localizeFileError(new Error("refusing to rename directory"))).toContain(
      "Cannot rename a folder",
    );
  });

  test("falls back to the raw message on unknown errors", () => {
    expect(localizeFileError(new Error("something obscure"))).toBe("something obscure");
  });

  test("accepts non-Error values", () => {
    expect(localizeFileError("file not found")).toContain("no longer exists");
  });
});
