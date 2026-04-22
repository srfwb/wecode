import { CreateProjectModal } from "./CreateProjectModal";
import { DeleteProjectDialog } from "./DeleteProjectDialog";
import { useProjectModalStore } from "./modalStore";
import { RenameProjectModal } from "./RenameProjectModal";

export function ProjectModalsHost() {
  const createPayload = useProjectModalStore((s) => s.createProject);
  const renamePayload = useProjectModalStore((s) => s.renameProject);
  const deletePayload = useProjectModalStore((s) => s.deleteProject);

  return (
    <>
      {createPayload && <CreateProjectModal initialTemplateId={createPayload.templateId} />}
      {renamePayload && <RenameProjectModal projectId={renamePayload.id} />}
      {deletePayload && <DeleteProjectDialog projectId={deletePayload.id} />}
    </>
  );
}
