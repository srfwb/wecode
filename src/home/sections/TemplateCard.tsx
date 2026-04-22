import { useProjectModalStore } from "../../projects/ui/modalStore";
import type { Template } from "../../projects/templates";

interface Props {
  template: Template;
}

export function TemplateCard({ template }: Props) {
  const openCreate = useProjectModalStore((s) => s.openCreate);
  const glyph = template.kind === "blank" ? "+" : template.kind.toUpperCase();
  return (
    <button
      type="button"
      className="home-tpl"
      onClick={() => openCreate({ templateId: template.id })}
    >
      <div className={`home-tpl-glyph home-tpl-glyph--${template.kind}`}>
        <span>{glyph}</span>
      </div>
      <div className="home-tpl-title">{template.title}</div>
      <div className="home-tpl-desc">{template.description}</div>
    </button>
  );
}
