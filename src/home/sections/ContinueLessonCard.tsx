import { IconChevronRight } from "../icons";
import { useLessonStore } from "../../lessons/lessonStore";
import type { LessonData } from "../../lessons/types";

interface Props {
  lesson: LessonData;
  doneCount: number;
  totalCount: number;
}

export function ContinueLessonCard({ lesson, doneCount, totalCount }: Props) {
  return (
    <div className="home-continue">
      <div className="home-continue-main">
        <div className="home-continue-eyebrow">
          <span className="home-continue-pulse" aria-hidden="true" />
          Pick up where you left off
        </div>
        <h2 className="home-continue-title">{lesson.title}</h2>
        <p className="home-continue-sub">
          <span className="home-continue-meta">
            {lesson.type === "lesson" ? "Lesson" : "Challenge"} · checkpoint {doneCount} /{" "}
            {totalCount}
          </span>
        </p>
      </div>
      <div className="home-continue-actions">
        <button
          type="button"
          className="home-btn home-btn--primary"
          onClick={() => useLessonStore.getState().startLesson(lesson.id)}
        >
          Continue
          <IconChevronRight />
        </button>
      </div>
    </div>
  );
}
