import { useState } from "react";

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

  if (!project) return null;

  const nameError = name.length > 0 ? validateProjectName(name) : "";
  const canSubmit = name.trim().length > 0 && !nameError && name.trim() !== project.name;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      renameProject(projectId, name.trim());
      toast.success(`Projet renommé en « ${name.trim()} ».`);
      closeAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <form className="modal" onSubmit={submit}>
        <div className="modal__title">Renommer le projet</div>
        <div className="modal__body">
          Le dossier sur disque garde son nom d'origine — seule l'étiquette dans WeCode change.
        </div>
        <label className="modal__field">
          <span className="modal__label">Nouveau nom</span>
          <input
            className="modal__input"
            value={name}
            autoFocus
            onChange={(e) => setName(e.target.value)}
          />
          {nameError && <span className="modal__error">{nameError}</span>}
        </label>
        <div className="modal__actions">
          <button type="button" onClick={closeAll}>
            Annuler
          </button>
          <button type="submit" disabled={!canSubmit}>
            Renommer
          </button>
        </div>
      </form>
    </div>
  );
}
