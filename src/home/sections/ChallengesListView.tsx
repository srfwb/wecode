import { CHALLENGES } from "../../lessons/data";
import { useLessonStore } from "../../lessons/lessonStore";
import { LessonCard } from "./LessonCard";

export function ChallengesListView() {
  const activeLessonId = useLessonStore((s) => s.activeLessonId);
  const checkpointStates = useLessonStore((s) => s.checkpointStates);

  const completed = CHALLENGES.filter((challenge) => {
    if (challenge.id !== activeLessonId) return false;
    const allIds = challenge.steps.flatMap((step) => step.checkpoints.map((cp) => cp.id));
    return allIds.length > 0 && allIds.every((id) => checkpointStates[id] === "done");
  }).length;

  return (
    <section className="home-section">
      <div className="home-sec-head">
        <h3>All challenges</h3>
        <span className="home-sec-count">
          {completed} / {CHALLENGES.length}
        </span>
      </div>
      <div className="lesson-grid">
        {CHALLENGES.map((challenge) => {
          const allIds = challenge.steps.flatMap((step) => step.checkpoints.map((cp) => cp.id));
          const doneCount = allIds.filter((id) => checkpointStates[id] === "done").length;
          const isActive = challenge.id === activeLessonId;

          const status: "not-started" | "completed" =
            isActive && allIds.length > 0 && doneCount === allIds.length
              ? "completed"
              : "not-started";

          return (
            <LessonCard
              key={challenge.id}
              lesson={challenge}
              status={status}
              onStart={() => useLessonStore.getState().startLesson(challenge.id)}
            />
          );
        })}
      </div>
    </section>
  );
}
