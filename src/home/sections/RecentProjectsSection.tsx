import { useState } from "react";

import { ContextMenu } from "../../ide/tree/ContextMenu";
import { useProjectStore } from "../../projects/projectStore";
import { useProjectModalStore } from "../../projects/ui/modalStore";
import { usePaletteStore } from "../../palette/paletteStore";
import { IconSparkle } from "../icons";
import { EmptyState } from "./EmptyState";
import { ProjectCard } from "./ProjectCard";

export function RecentProjectsSection() {
  const rawProjects = useProjectStore((s) => s.projects);
  const projects = [...rawProjects].sort((a, b) => b.lastOpenedAt - a.lastOpenedAt);
  const openCreate = useProjectModalStore((s) => s.openCreate);
  const openPalette = usePaletteStore((s) => s.openPalette);
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);

  const onSectionContext = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenu({ x: e.clientX, y: e.clientY });
  };

  return (
    <section className="home-section" onContextMenu={onSectionContext}>
      <div className="home-sec-head">
        <h3>Projets récents</h3>
        {projects.length > 0 && <span className="home-sec-count">{projects.length}</span>}
      </div>
      {projects.length > 0 ? (
        <div className="home-proj-grid">
          {projects.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<IconSparkle />}
          title="Pas encore de projets"
          subtitle="La liste de tes projets récents arrivera avec le système de projets."
        />
      )}
      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          onClose={() => setMenu(null)}
          items={[
            {
              label: "Nouveau projet",
              onSelect: () => openCreate({ templateId: "html-css" }),
            },
            {
              label: "Rechercher…",
              onSelect: () => openPalette(),
            },
          ]}
        />
      )}
    </section>
  );
}
