import { CreateProjectModal } from "./CreateProjectModal";
import { useProjectModalStore } from "./modalStore";

export function ProjectModalsHost() {
  const createPayload = useProjectModalStore((s) => s.createProject);

  return (
    <>
      {createPayload && <CreateProjectModal initialTemplateId={createPayload.templateId} />}
    </>
  );
}
