import { extname } from "../../vfs/paths";

interface FileTypeIconProps {
  path: string;
  folder?: boolean;
}

interface Descriptor {
  variant: "html" | "css" | "js" | "md" | "img" | "folder" | "other";
  glyph: string;
}

const FALLBACK: Descriptor = { variant: "other", glyph: "·" };
const FOLDER: Descriptor = { variant: "folder", glyph: "" };

const EXTENSION_MAP: Record<string, Descriptor> = {
  ".html": { variant: "html", glyph: "◇" },
  ".htm": { variant: "html", glyph: "◇" },
  ".css": { variant: "css", glyph: "#" },
  ".js": { variant: "js", glyph: "JS" },
  ".mjs": { variant: "js", glyph: "JS" },
  ".ts": { variant: "js", glyph: "TS" },
  ".tsx": { variant: "js", glyph: "TSX" },
  ".json": { variant: "md", glyph: "{}" },
  ".md": { variant: "md", glyph: "MD" },
  ".svg": { variant: "img", glyph: "SVG" },
  ".png": { variant: "img", glyph: "IMG" },
  ".jpg": { variant: "img", glyph: "IMG" },
  ".jpeg": { variant: "img", glyph: "IMG" },
  ".gif": { variant: "img", glyph: "IMG" },
  ".webp": { variant: "img", glyph: "IMG" },
};

function describe(path: string, folder: boolean): Descriptor {
  if (folder) return FOLDER;
  return EXTENSION_MAP[extname(path).toLowerCase()] ?? FALLBACK;
}

export function FileTypeIcon({ path, folder = false }: FileTypeIconProps) {
  const d = describe(path, folder);
  if (d.variant === "folder") {
    return (
      <span className="fi fi--folder" aria-hidden="true">
        <svg className="i" viewBox="0 0 24 24" style={{ width: 13, height: 13 }}>
          <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        </svg>
      </span>
    );
  }
  return (
    <span className={`fi fi--${d.variant}`} aria-hidden="true">
      {d.glyph}
    </span>
  );
}
