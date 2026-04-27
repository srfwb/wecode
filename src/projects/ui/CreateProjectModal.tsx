import { invoke } from "@tauri-apps/api/core";
import { open as openDialog } from "@tauri-apps/plugin-dialog";
import { useEffect, useRef, useState } from "react";

import { useModalA11y } from "../../hooks/useModalA11y";
import { toast } from "../../ide/shell/toastStore";
import { createProject } from "../actions";
import { joinChild, validateProjectName } from "../paths";
import { TEMPLATES, type TemplateId } from "../templates";
import { useProjectModalStore } from "./modalStore";

interface Props {
  initialTemplateId: TemplateId;
}

export function CreateProjectModal({ initialTemplateId }: Props) {
  const closeAll = useProjectModalStore((s) => s.closeAll);
  const [name, setName] = useState("");
  const [templateId, setTemplateId] = useState<TemplateId>(initialTemplateId);
  const [parentDir, setParentDir] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const modalRef = useRef<HTMLFormElement>(null);
  useModalA11y(modalRef, { onClose: closeAll });

  useEffect(() => {
    void (async () => {
      try {
        const root = await invoke<string>("fs_default_projects_root");
        setParentDir(root);
      } catch (err) {
        console.warn("default projects root failed", err);
      }
    })();
  }, []);

  const nameError = name.length > 0 ? validateProjectName(name) : "";
  const finalPath = name && parentDir ? joinChild(parentDir, name.trim()) : "";
  const canSubmit = name.trim().length > 0 && !nameError && !submitting;

  const pickLocation = async () => {
    try {
      const picked = await openDialog({
        directory: true,
        multiple: false,
        title: "Choose a location",
        ...(parentDir ? { defaultPath: parentDir } : {}),
      });
      if (typeof picked === "string") setParentDir(picked);
    } catch (err) {
      console.warn("dialog open failed", err);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await createProject({ name: name.trim(), templateId, parentDir });
      toast.success(`Project "${name.trim()}" created.`);
      closeAll();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={closeAll}>
      <form
        ref={modalRef}
        className="modal modal--wide"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-project-title"
        onSubmit={submit}
      >
        <div id="create-project-title" className="modal__title">
          New project
        </div>
        <label className="modal__field">
          <span className="modal__label">Project name</span>
          <input
            className="modal__input"
            value={name}
            autoFocus
            onChange={(e) => setName(e.target.value)}
            placeholder="My awesome project"
          />
          {nameError && <span className="modal__error">{nameError}</span>}
        </label>

        <div className="modal__field">
          <span className="modal__label">Template</span>
          <div className="modal__template-list">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`modal__template${templateId === t.id ? " modal__template--active" : ""}`}
                onClick={() => setTemplateId(t.id)}
              >
                <div className="modal__template-title">{t.title}</div>
                <div className="modal__template-desc">{t.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="modal__field">
          <span className="modal__label">Location</span>
          <div className="modal__location">
            <span className="modal__location-path" title={finalPath || parentDir}>
              {finalPath || `${parentDir}/…`}
            </span>
            <button type="button" className="modal__btn-ghost" onClick={() => void pickLocation()}>
              Change…
            </button>
          </div>
        </div>

        <div className="modal__actions">
          <button type="button" onClick={closeAll} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" disabled={!canSubmit}>
            {submitting ? "Creating…" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}
