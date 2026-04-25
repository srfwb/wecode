// Logo mark variants from the brand sheet:
// - "tile" (default): gradient amber square with the W in dark strokes (primary)
// - "naked": just the W strokes in accent color (tightest spaces)
// - "outline": transparent tile with accent border, W in accent

type Variant = "tile" | "naked" | "outline";

interface Props {
  size?: number;
  variant?: Variant;
}

export function LogoMark({ size = 20, variant = "tile" }: Props) {
  if (variant === "naked") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        className="brand-mark"
        style={{ color: "var(--accent)" }}
        aria-hidden="true"
      >
        <use href="#we-mark" />
      </svg>
    );
  }

  return (
    <span
      className={`brand-tile${variant === "outline" ? " brand-tile--outline" : ""}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 64 64"
        style={{ color: variant === "outline" ? "var(--accent)" : "var(--bg-0)" }}
      >
        <use href="#we-mark" />
      </svg>
    </span>
  );
}

// Hidden SVG placed once in the DOM. Contains shared symbol definitions so
// every <LogoMark> can reference them via <use href="#we-mark">.
export function LogoDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <symbol id="we-mark" viewBox="0 0 64 64">
          <g
            fill="none"
            stroke="currentColor"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 18 L22 46 L32 24 L42 46 L50 18" />
          </g>
        </symbol>
      </defs>
    </svg>
  );
}
