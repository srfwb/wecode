import { useState } from "react";

import { MOCK_LESSON, type Checkpoint } from "./mockLesson";
import { ProgressRing } from "./ProgressRing";

export function LessonDock() {
  const [collapsed, setCollapsed] = useState(false);
  const lesson = MOCK_LESSON;
  const done = lesson.checkpoints.filter((cp) => cp.status === "done").length;
  const total = lesson.checkpoints.length;
  const progress = total === 0 ? 0 : done / total;

  return (
    <aside className={collapsed ? "dock dock--collapsed" : "dock"}>
      <button
        type="button"
        className="dock-head"
        onClick={() => setCollapsed((c) => !c)}
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
              <p
                key={i}
                // Content is bundled at build time (see mockLesson.ts) — never user input.
                dangerouslySetInnerHTML={{ __html: p.html }}
              />
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
            {lesson.checkpoints.map((cp, i) => (
              <CheckpointRow key={i} checkpoint={cp} />
            ))}
          </div>
        </div>
      )}
    </aside>
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
