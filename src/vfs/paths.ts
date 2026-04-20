// eslint-disable-next-line no-control-regex -- intentional: reject control chars in paths
const FORBIDDEN_CHARS_RE = /[\\:*?"<>|\x00-\x1f]/;

export function normalize(input: string): string {
  if (typeof input !== "string") {
    throw new TypeError("path must be a string");
  }
  let p = input.trim();
  if (p === "") {
    throw new Error("path must not be empty");
  }
  if (!p.startsWith("/")) {
    p = "/" + p;
  }
  p = p.replace(/\/+/g, "/");
  if (p.length > 1 && p.endsWith("/")) {
    p = p.slice(0, -1);
  }
  const segments = p.split("/").slice(1);
  for (const seg of segments) {
    if (seg === "" || seg === "." || seg === "..") {
      throw new Error(`invalid path segment "${seg}" in ${input}`);
    }
    if (FORBIDDEN_CHARS_RE.test(seg)) {
      throw new Error(`forbidden character in segment "${seg}"`);
    }
  }
  return p;
}

export function basename(path: string): string {
  const p = normalize(path);
  const i = p.lastIndexOf("/");
  return p.slice(i + 1);
}

export function dirname(path: string): string {
  const p = normalize(path);
  const i = p.lastIndexOf("/");
  return i === 0 ? "/" : p.slice(0, i);
}

export function extname(path: string): string {
  const base = basename(path);
  const i = base.lastIndexOf(".");
  return i <= 0 ? "" : base.slice(i);
}
