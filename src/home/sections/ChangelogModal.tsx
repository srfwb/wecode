import { useRef } from "react";

import { useModalA11y } from "../../hooks/useModalA11y";
import changelogRaw from "../../changelog.md?raw";

interface Props {
  onClose: () => void;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function applyInline(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.+?)`/g, '<span class="inline-code">$1</span>');
}

function renderMarkdown(md: string): string {
  return md
    .split("\n")
    .map((line) => {
      if (line.startsWith("# ")) return `<h2 class="cl-h1">${applyInline(line.slice(2))}</h2>`;
      if (line.startsWith("## ")) return `<h3 class="cl-h2">${applyInline(line.slice(3))}</h3>`;
      if (line.startsWith("### ")) return `<h4 class="cl-h3">${applyInline(line.slice(4))}</h4>`;
      if (line.startsWith("---")) return '<hr class="cl-hr"/>';
      if (line.startsWith("- ")) return `<li class="cl-li">${applyInline(line.slice(2))}</li>`;
      if (line.trim() === "") return "";
      return `<p class="cl-p">${applyInline(line)}</p>`;
    })
    .join("\n");
}

export function ChangelogModal({ onClose }: Props) {
  const modalRef = useRef<HTMLDivElement>(null);
  useModalA11y(modalRef, { onClose });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        ref={modalRef}
        className="modal modal--wide cl-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="changelog-title"
      >
        <div id="changelog-title" className="modal__title">
          Nouveautés
        </div>
        <div
          className="cl-body"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(changelogRaw) }}
        />
        <div className="modal__actions">
          <button type="button" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
