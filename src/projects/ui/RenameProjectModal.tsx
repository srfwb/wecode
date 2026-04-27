import { useRef, useState } from "react";

import { useModalA11y } from "../../hooks/useModalA11y";
import { toast } from "../../ide/shell/toastStore";
import { renameProject } from "../actions";
import { validateProjectName } from "../paths";
import { useProjectStore } from "../projectStore";
import { useProjectModalStore } from "./modalStore";

interface Props {
  projectId: string;
}

export function RenameProjectModal({ projectId }: Props) {
  const closeAll = useProjectModalStore((s) => s.closeAll);
  const project = useProjectStore((s) => s.projects.find((p) => p.id === projectId));
  const [name, setName] = useState(project?.name ?? "");
  const [submitting, setSubmitting] = useState(false);
  const modalRef = useRef<HTMLFormElement>(null);
  useModalA11y(modalRef, { onClose: closeAll });

  if (!project) return null;

  const nameError = name.length > 0 ? validateProjectName(name) : "";
  const canSubmit =
    !submitting && name.trim().length > 0 && !nameError && name.trim() !== project.name;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      renameProject(projectId, name.trim());
      toast.success(`Project renamed to "${name.trim()}".`);
      closeAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={closeAll}>
      <form
        ref={modalRef}
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="rename-project-title"
        onSubmit={submit}
      >
        <div id="rename-project-title" className="modal__title">
          Rename project
        </div>
        <div className="modal__body">
          The folder on disk keeps its original name — only the label in WeCode changes.
        </div>
        <label className="modal__field">
          <span className="modal__label">New name</span>
          <input
            className="modal__input"
            value={name}
            autoFocus
            onChange={(e) => setName(e.target.value)}
          />
          {nameError && <span className="modal__error">{nameError}</span>}
        </label>
        <div className="modal__actions">
          <button type="button" onClick={closeAll} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" disabled={!canSubmit}>
            {submitting ? "Renaming…" : "Rename"}
          </button>
        </div>
      </form>
    </div>
  );
}
