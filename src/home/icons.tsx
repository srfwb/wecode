import type { SVGProps } from "react";

function Svg(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" className="i" aria-hidden="true" {...props} />;
}

export function IconHome() {
  return (
    <Svg>
      <path d="M3 12 12 3l9 9" />
      <path d="M5 10v10h14V10" />
    </Svg>
  );
}

export function IconSearch() {
  return (
    <Svg>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Svg>
  );
}

export function IconShield() {
  return (
    <Svg>
      <path d="M12 2 4 6v6c0 4.5 3.3 8.6 8 10 4.7-1.4 8-5.5 8-10V6l-8-4Z" />
    </Svg>
  );
}

export function IconHelp() {
  return (
    <Svg>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.1 9a3 3 0 1 1 4.9 2.3c-.8.6-2 1.1-2 2.7" />
      <path d="M12 17h.01" />
    </Svg>
  );
}

export function IconBulb() {
  return (
    <Svg>
      <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.7.6 1 1.4 1 2.3h6c0-.9.3-1.7 1-2.3A7 7 0 0 0 12 2Z" />
    </Svg>
  );
}

export function IconClock() {
  return (
    <Svg>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </Svg>
  );
}

export function IconSparkle() {
  return (
    <Svg>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />
    </Svg>
  );
}

export function IconChevronRight() {
  return (
    <Svg>
      <path d="m9 6 6 6-6 6" />
    </Svg>
  );
}
