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

export function IconBook() {
  return (
    <Svg>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
    </Svg>
  );
}

export function IconLightning() {
  return (
    <Svg>
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
    </Svg>
  );
}

export function IconList() {
  return (
    <Svg>
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </Svg>
  );
}

export function IconGear() {
  return (
    <Svg>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </Svg>
  );
}
