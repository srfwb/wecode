import { describe, expect, it } from "vitest";

import { joinChild, validateProjectName } from "./paths";

describe("joinChild", () => {
  it("joins with forward slash on posix roots", () => {
    expect(joinChild("/tmp/projects", "hello")).toBe("/tmp/projects/hello");
  });

  it("joins with backslash on Windows-style roots", () => {
    expect(joinChild("C:\\Users\\Demdem\\Documents\\WeCode", "Mon projet")).toBe(
      "C:\\Users\\Demdem\\Documents\\WeCode\\Mon projet",
    );
  });

  it("does not add a double separator if parent ends with one", () => {
    expect(joinChild("/tmp/projects/", "hello")).toBe("/tmp/projects/hello");
    expect(joinChild("C:\\Projects\\", "hello")).toBe("C:\\Projects\\hello");
  });
});

describe("validateProjectName", () => {
  it("accepts normal names", () => {
    expect(validateProjectName("Mon projet")).toBe("");
    expect(validateProjectName("demo-01")).toBe("");
  });

  it("rejects empty or whitespace-only names", () => {
    expect(validateProjectName("")).not.toBe("");
    expect(validateProjectName("   ")).not.toBe("");
  });

  it("rejects forbidden filesystem characters", () => {
    expect(validateProjectName("hello/world")).toMatch(/cannot contain/i);
    expect(validateProjectName("hello:world")).toMatch(/cannot contain/i);
    expect(validateProjectName("hello?world")).toMatch(/cannot contain/i);
  });

  it("rejects special names . and ..", () => {
    expect(validateProjectName(".")).not.toBe("");
    expect(validateProjectName("..")).not.toBe("");
  });

  it("rejects names longer than 80 characters", () => {
    expect(validateProjectName("x".repeat(81))).toMatch(/too long/i);
  });

  it("rejects windows reserved device names", () => {
    expect(validateProjectName("CON")).toMatch(/reserved/i);
    expect(validateProjectName("prn")).toMatch(/reserved/i);
    expect(validateProjectName("NUL")).toMatch(/reserved/i);
    expect(validateProjectName("COM1")).toMatch(/reserved/i);
    expect(validateProjectName("LPT9")).toMatch(/reserved/i);
  });

  it("rejects windows reserved names even with an extension", () => {
    // CON.txt is as broken as CON on Windows.
    expect(validateProjectName("CON.txt")).toMatch(/reserved/i);
  });

  it("allows names that merely contain a reserved substring", () => {
    expect(validateProjectName("console")).toBe("");
    expect(validateProjectName("auxiliary-notes")).toBe("");
  });
});
