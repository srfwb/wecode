import { CreateProjectModal } from "./CreateProjectModal";
import { useProjectModalStore } from "./modalStore";
import { RenameProjectModal } from "./RenameProjectModal";

export function ProjectModalsHost() {
  const createPayload = useProjectModalStore((s) => s.createProject);
  const renamePayload = useProjectModalStore((s) => s.renameProject);

  return (
    <>
      {createPayload && <CreateProjectModal initialTemplateId={createPayload.templateId} />}
      {renamePayload && <RenameProjectModal projectId={renamePayload.id} />}
    </>
  );
}
