interface ProgressRingProps {
  /** 0..1 */
  value: number;
  size?: number;
}

const RADIUS = 9;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ProgressRing({ value, size = 22 }: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(1, value));
  const offset = CIRCUMFERENCE * (1 - clamped);
  return (
    <div className="progress-ring" style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <circle className="bg" cx="12" cy="12" r={RADIUS} strokeWidth="2.5" fill="none" />
        <circle
          className="fg"
          cx="12"
          cy="12"
          r={RADIUS}
          strokeWidth="2.5"
          fill="none"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
