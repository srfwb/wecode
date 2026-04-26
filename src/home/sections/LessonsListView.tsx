import { LESSONS } from "../../lessons/data";
import { useLessonStore } from "../../lessons/lessonStore";
import { LessonCard } from "./LessonCard";

export function LessonsListView() {
  const activeLessonId = useLessonStore((s) => s.activeLessonId);
  const checkpointStates = useLessonStore((s) => s.checkpointStates);

  const completed = LESSONS.filter((lesson) => {
    if (lesson.id !== activeLessonId) return false;
    const allIds = lesson.steps.flatMap((step) => step.checkpoints.map((cp) => cp.id));
    return allIds.length > 0 && allIds.every((id) => checkpointStates[id] === "done");
  }).length;

  return (
    <section className="home-section">
      <div className="home-sec-head">
        <h3>Toutes les leçons</h3>
        <span className="home-sec-count">
          {completed} / {LESSONS.length}
        </span>
      </div>
      <div className="lesson-grid">
        {LESSONS.map((lesson) => {
          const allIds = lesson.steps.flatMap((step) => step.checkpoints.map((cp) => cp.id));
          const doneCount = allIds.filter((id) => checkpointStates[id] === "done").length;
          const isActive = lesson.id === activeLessonId;

          let status: "not-started" | "in-progress" | "completed";
          if (isActive && doneCount > 0 && doneCount < allIds.length) {
            status = "in-progress";
          } else if (isActive && allIds.length > 0 && doneCount === allIds.length) {
            status = "completed";
          } else {
            status = "not-started";
          }

          return (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              status={status}
              completedCheckpoints={doneCount}
              totalCheckpoints={allIds.length}
              onStart={() => useLessonStore.getState().startLesson(lesson.id)}
            />
          );
        })}
      </div>
    </section>
  );
}
