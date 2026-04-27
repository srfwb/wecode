import { useIdeStore } from "../../state/ideStore";
import { DEVICE_ORDER, DEVICE_SIZES } from "./devices";

interface PreviewBarProps {
  onRefresh: () => void;
  path: string;
}

export function PreviewBar({ onRefresh, path }: PreviewBarProps) {
  const device = useIdeStore((s) => s.previewDevice);
  const setDevice = useIdeStore((s) => s.setPreviewDevice);

  return (
    <div className="prev-bar">
      <button
        type="button"
        className="t-btn"
        onClick={onRefresh}
        title="Reload preview"
        aria-label="Reload preview"
      >
        <svg className="i" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 12a9 9 0 0 1 15.5-6.3L21 8" />
          <path d="M21 3v5h-5" />
          <path d="M21 12a9 9 0 0 1-15.5 6.3L3 16" />
          <path d="M3 21v-5h5" />
        </svg>
      </button>

      <div className="prev-url" aria-label="Preview address">
        <span className="dot-g" aria-hidden="true" />
        <span>localhost</span>
        <span className="path">{path}</span>
        <span className="live">
          <span className="pulse" aria-hidden="true" />
          live
        </span>
      </div>

      <div className="device-switch" role="group" aria-label="Preview size">
        {DEVICE_ORDER.map((d) => (
          <button
            key={d}
            type="button"
            className={d === device ? "ds ds--active" : "ds"}
            onClick={() => setDevice(d)}
            title={DEVICE_SIZES[d].label}
            aria-pressed={d === device}
          >
            {d === "mobile" ? (
              <svg
                className="i"
                viewBox="0 0 24 24"
                style={{ width: 12, height: 12 }}
                aria-hidden="true"
              >
                <rect x="7" y="2" width="10" height="20" rx="2" />
                <path d="M11 18h2" />
              </svg>
            ) : (
              <svg
                className="i"
                viewBox="0 0 24 24"
                style={{ width: 12, height: 12 }}
                aria-hidden="true"
              >
                <rect x="2" y="4" width="20" height="13" rx="2" />
                <path d="M8 21h8M12 17v4" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
