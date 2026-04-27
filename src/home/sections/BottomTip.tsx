import { useState } from "react";

import { IconBulb } from "../icons";

export function BottomTip() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className="home-tip">
      <div className="home-tip-icon" aria-hidden="true">
        <IconBulb />
      </div>
      <div className="home-tip-body">
        <strong>Tip.</strong> Hover any keyword in the editor for a quick explanation — that's how
        this IDE teaches.
      </div>
      <button
        type="button"
        className="home-tip-dismiss"
        onClick={() => setVisible(false)}
        aria-label="Dismiss tip"
      >
        Got it ✕
      </button>
    </div>
  );
}
