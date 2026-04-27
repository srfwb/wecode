import { useIdeStore } from "../../state/ideStore";
import { useLessonContext } from "../../lessons/useLessonContext";
import type { CheckpointDef, LessonParagraph } from "../../lessons/types";
import type { CheckpointStatus } from "../../lessons/types";
import { ProgressRing } from "./ProgressRing";

export function LessonDock() {
  const ctx = useLessonContext();
  const dockCollapsed = useIdeStore((s) => s.dockCollapsed);
  const setDockCollapsed = useIdeStore((s) => s.setDockCollapsed);

  if (!ctx) return null;

  const { lesson, checkpoints, currentStepIndex, progress } = ctx;
  const step = lesson.steps[currentStepIndex];
  if (!step) return null;

  const doneCount = checkpoints.filter((c) => c.status === "done").length;
  const totalCount = checkpoints.length;

  const toggleDock = () => setDockCollapsed(!dockCollapsed);

  return (
    <aside className={`dock${dockCollapsed ? " collapsed" : ""}`}>
      <button
        type="button"
        className="dock-head"
        onClick={toggleDock}
        aria-expanded={!dockCollapsed}
      >
        <svg className="i-lg chev" viewBox="0 0 24 24" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
        <span className="lesson-chip">
          <span className="num">{currentStepIndex + 1}</span>
          {lesson.type === "lesson" ? "Leçon" : "Challenge"} · {step.heading}
        </span>
        <div className="progress">
          <span>
            {doneCount} / {totalCount} points
          </span>
          <ProgressRing value={progress} />
        </div>
      </button>
      <div className="dock-body">
        <div className="lesson-text">
          <h2>{step.heading}</h2>
          {step.paragraphs.map((p, i) => (
            <ParagraphView key={i} paragraph={p} />
          ))}
          <p className="lesson-hint">
            <svg className="i" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            Survole un mot-clé dans l&apos;éditeur pour une explication rapide.
          </p>
        </div>
        <div className="checkpoints">
          {step.checkpoints.map((cp) => {
            const state = checkpoints.find((c) => c.id === cp.id);
            return <CheckpointRow key={cp.id} checkpoint={cp} status={state?.status ?? "todo"} />;
          })}
        </div>
      </div>
    </aside>
  );
}

/** Split backtick-delimited segments into plain text and inline-code spans. */
function renderInlineCode(text: string) {
  const parts = text.split("`");
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="inline-code">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

function ParagraphView({ paragraph }: { paragraph: LessonParagraph }) {
  if (paragraph.kind === "code") {
    return (
      <pre>
        <code>{paragraph.content}</code>
      </pre>
    );
  }
  return <p>{renderInlineCode(paragraph.content)}</p>;
}

function CheckpointRow({
  checkpoint,
  status,
}: {
  checkpoint: CheckpointDef;
  status: CheckpointStatus;
}) {
  const cls = `cp${status === "done" ? " done" : status === "active" ? " active" : ""}`;
  const metaCls = `meta${status === "active" ? " live" : ""}`;
  const metaText = status === "done" ? "fait" : status === "active" ? "vérification…" : "—";

  return (
    <div className={cls}>
      <span className="tick" aria-hidden="true">
        ✓
      </span>
      <span className="label">{renderInlineCode(checkpoint.label)}</span>
      <span className={metaCls}>{metaText}</span>
    </div>
  );
}
