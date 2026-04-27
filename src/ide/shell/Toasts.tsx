import type { ReactElement } from "react";

import { type ToastKind, useToastStore } from "./toastStore";

const ICONS: Record<ToastKind, ReactElement> = {
  info: (
    <svg className="i" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4M12 16h.01" />
    </svg>
  ),
  success: (
    <svg className="i" viewBox="0 0 24 24" aria-hidden="true">
      <path d="m5 13 4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="i" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16h.01" />
    </svg>
  ),
};

export function Toasts() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (toasts.length === 0) return null;
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.kind}`}>
          <span className="toast__icon" aria-hidden="true">
            {ICONS[t.kind]}
          </span>
          <span className="toast__message">{t.message}</span>
          <button
            type="button"
            className="toast__close"
            aria-label="Close notification"
            onClick={() => dismiss(t.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
