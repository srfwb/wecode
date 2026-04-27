import { useRef, useState } from "react";

import { useModalA11y } from "../../hooks/useModalA11y";
import { toast } from "../../ide/shell/toastStore";
import { deleteProject } from "../actions";
import { useProjectStore } from "../projectStore";
import { useProjectModalStore } from "./modalStore";

interface Props {
  projectId: string;
}

export function DeleteProjectDialog({ projectId }: Props) {
  const closeAll = useProjectModalStore((s) => s.closeAll);
  const project = useProjectStore((s) => s.projects.find((p) => p.id === projectId));
  const [removeFromDisk, setRemoveFromDisk] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  useModalA11y(modalRef, { onClose: submitting ? () => {} : closeAll });

  if (!project) return null;

  const submit = async () => {
    setSubmitting(true);
    try {
      await deleteProject(projectId, { removeFromDisk });
      toast.success(
        removeFromDisk
          ? `Project "${project.name}" and its folder deleted.`
          : `Project "${project.name}" removed from WeCode.`,
      );
      closeAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={() => {
        if (!submitting) closeAll();
      }}
    >
      <div
        ref={modalRef}
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-project-title"
      >
        <div id="delete-project-title" className="modal__title">
          Delete project
        </div>
        <div className="modal__body">
          Project <strong>{project.name}</strong> will be removed from your list.
          <div className="modal__path" title={project.path}>
            {project.path}
          </div>
          <label className="modal__checkbox">
            <input
              type="checkbox"
              checked={removeFromDisk}
              onChange={(e) => setRemoveFromDisk(e.target.checked)}
            />
            <span>Also delete the folder and all its files from disk</span>
          </label>
          {removeFromDisk && (
            <div className="modal__warning">
              This action cannot be undone. The files will be permanently deleted.
            </div>
          )}
        </div>
        <div className="modal__actions">
          <button type="button" onClick={closeAll} disabled={submitting}>
            Cancel
          </button>
          <button
            type="button"
            className="modal__btn-destructive"
            onClick={() => void submit()}
            disabled={submitting}
          >
            {submitting ? "Deleting…" : removeFromDisk ? "Delete folder" : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
}
