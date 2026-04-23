import { describe, expect, test } from "vitest";

import { localizeFileError } from "./fileErrorMessages";

describe("localizeFileError", () => {
  test("translates forbidden-character errors", () => {
    expect(localizeFileError(new Error("forbidden character in segment: foo|bar"))).toContain(
      "caractère interdit",
    );
  });

  test("translates invalid path segment errors", () => {
    expect(localizeFileError(new Error('invalid path segment "."'))).toContain(". » ou « ..");
  });

  test("translates already-exists errors", () => {
    expect(localizeFileError(new Error("file already exists"))).toContain(
      "du même nom existe déjà",
    );
  });

  test("translates rename-directory refusal", () => {
    expect(localizeFileError(new Error("refusing to rename directory"))).toContain(
      "renommer un dossier",
    );
  });

  test("falls back to the raw message on unknown errors", () => {
    expect(localizeFileError(new Error("something obscure"))).toBe("something obscure");
  });

  test("accepts non-Error values", () => {
    expect(localizeFileError("file not found")).toContain("n'existe plus");
  });
});
