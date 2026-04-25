interface Props {
  size?: number;
}

export function LogoMark({ size = 20 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className="brand-mark"
    >
      <rect width="64" height="64" rx="15" fill="url(#logo-grad)" />
      <path
        d="M14 18 L22 46 L32 24 L42 46 L50 18"
        stroke="var(--bg-0)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--accent)" />
          <stop offset="1" stopColor="var(--accent-dim)" />
        </linearGradient>
      </defs>
    </svg>
  );
}
