import type { LessonData } from "../../lessons/types";

interface Props {
  lesson: LessonData;
  status: "not-started" | "in-progress" | "completed";
  completedCheckpoints?: number;
  totalCheckpoints?: number;
  onStart: () => void;
}

export function LessonCard({
  lesson,
  status,
  completedCheckpoints = 0,
  totalCheckpoints = 0,
  onStart,
}: Props) {
  const progressRatio =
    status === "in-progress" && totalCheckpoints > 0 ? completedCheckpoints / totalCheckpoints : 0;

  return (
    <button
      type="button"
      className={`lesson-card${status === "in-progress" ? " lesson-card--in-progress" : ""}`}
      onClick={onStart}
      aria-label={`Start ${lesson.title}`}
    >
      <div className="lesson-card__header">
        {status === "completed" && (
          <span className="lesson-card__badge lesson-card__badge--done">✓ completed</span>
        )}
        {status === "in-progress" && (
          <span className="lesson-card__badge lesson-card__badge--active">● in progress</span>
        )}
        {status === "not-started" && (
          <span className="lesson-card__badge lesson-card__badge--todo">not started</span>
        )}
        <span className="lesson-card__time">~{lesson.estimatedMinutes} min</span>
      </div>

      <div className="lesson-card__title">{lesson.title}</div>

      <div className="lesson-card__desc">{lesson.description}</div>

      {status === "in-progress" && totalCheckpoints > 0 && (
        <div className="lesson-card__progress">
          <div
            className="lesson-card__progress-fill"
            style={{ width: `${progressRatio * 100}%` }}
          />
        </div>
      )}
    </button>
  );
}
