import { useIdeStore } from "../../state/ideStore";
import { MOCK_LESSON, type Checkpoint, type LessonParagraph } from "./mockLesson";
import { ProgressRing } from "./ProgressRing";

export function LessonDock() {
  const collapsed = useIdeStore((s) => s.dockCollapsed);
  const setCollapsed = useIdeStore((s) => s.setDockCollapsed);
  const lesson = MOCK_LESSON;
  const done = lesson.checkpoints.filter((cp) => cp.status === "done").length;
  const total = lesson.checkpoints.length;
  const progress = total === 0 ? 0 : done / total;

  return (
    <aside className={collapsed ? "dock dock--collapsed" : "dock"}>
      <button
        type="button"
        className="dock-head"
        onClick={() => setCollapsed(!collapsed)}
        aria-expanded={!collapsed}
      >
        <svg className="i-lg chev" viewBox="0 0 24 24" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
        <span className="lesson-chip">
          <span className="num">{lesson.chipNumber}</span>
          {lesson.chipLabel}
        </span>
        <div className="progress">
          <span>
            {done} / {total} points
          </span>
          <ProgressRing value={progress} />
        </div>
      </button>

      {!collapsed && (
        <div className="dock-body">
          <div className="lesson-text">
            <h2>{lesson.heading}</h2>
            {lesson.paragraphs.map((p, i) => (
              <LessonParagraphView key={i} paragraph={p} />
            ))}
            {lesson.hintFooter && (
              <p className="lesson-hint">
                <svg className="i" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
                {lesson.hintFooter}
              </p>
            )}
          </div>

          <div className="checkpoints">
            {lesson.checkpoints.map((cp) => (
              <CheckpointRow key={cp.id} checkpoint={cp} />
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}

function LessonParagraphView({ paragraph }: { paragraph: LessonParagraph }) {
  return (
    <p>
      {paragraph.parts.map((part, i) =>
        part.kind === "code" ? (
          <span key={i} className="inline-code">
            {part.value}
          </span>
        ) : (
          <span key={i}>{part.value}</span>
        ),
      )}
    </p>
  );
}

function CheckpointRow({ checkpoint }: { checkpoint: Checkpoint }) {
  const metaClass = checkpoint.status === "active" ? "meta meta--live" : "meta";
  return (
    <div className={`cp cp--${checkpoint.status}`}>
      <span className="tick" aria-hidden="true">
        ✓
      </span>
      <span className="label">{checkpoint.label}</span>
      <span className={metaClass}>{checkpoint.meta ?? ""}</span>
    </div>
  );
}
