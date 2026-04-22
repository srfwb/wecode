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
        <strong>Astuce.</strong> Survole n'importe quel mot dans l'éditeur pour voir une explication
        rapide — c'est comme ça que cet IDE enseigne.
      </div>
      <button
        type="button"
        className="home-tip-dismiss"
        onClick={() => setVisible(false)}
        aria-label="Masquer l'astuce"
      >
        Compris ✕
      </button>
    </div>
  );
}
