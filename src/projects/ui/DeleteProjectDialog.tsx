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
          ? `Projet « ${project.name} » et son dossier supprimés.`
          : `Projet « ${project.name} » retiré de WeCode.`,
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
          Supprimer le projet
        </div>
        <div className="modal__body">
          Le projet <strong>{project.name}</strong> sera retiré de ta liste.
          <div className="modal__path" title={project.path}>
            {project.path}
          </div>
          <label className="modal__checkbox">
            <input
              type="checkbox"
              checked={removeFromDisk}
              onChange={(e) => setRemoveFromDisk(e.target.checked)}
            />
            <span>Aussi supprimer le dossier et tous ses fichiers sur le disque</span>
          </label>
          {removeFromDisk && (
            <div className="modal__warning">
              Cette action est irréversible. Les fichiers seront définitivement supprimés.
            </div>
          )}
        </div>
        <div className="modal__actions">
          <button type="button" onClick={closeAll} disabled={submitting}>
            Annuler
          </button>
          <button
            type="button"
            className="modal__btn-destructive"
            onClick={() => void submit()}
            disabled={submitting}
          >
            {submitting ? "Suppression…" : removeFromDisk ? "Supprimer le dossier" : "Retirer"}
          </button>
        </div>
      </div>
    </div>
  );
}
