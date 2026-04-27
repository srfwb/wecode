import { useProjectStore } from "../../projects/projectStore";
import { useLessonStore } from "../../lessons/lessonStore";
import { getLessonById } from "../../lessons/data";
import { IconClock } from "../icons";
import { ContinueCard } from "./ContinueCard";
import { ContinueLessonCard } from "./ContinueLessonCard";
import { EmptyState } from "./EmptyState";

export function ContinueSection() {
  const projects = useProjectStore((s) => s.projects);
  const activeLessonId = useLessonStore((s) => s.activeLessonId);
  const checkpointStates = useLessonStore((s) => s.checkpointStates);

  const project =
    projects.length === 0
      ? null
      : ([...projects].sort((a, b) => b.lastOpenedAt - a.lastOpenedAt)[0] ?? null);

  // Determine if there is a lesson in progress (at least one done, but not all done)
  const activeLesson = activeLessonId !== null ? getLessonById(activeLessonId) : undefined;
  const lessonInProgress = (() => {
    if (!activeLesson) return null;
    const allCheckpointIds = activeLesson.steps.flatMap((step) =>
      step.checkpoints.map((cp) => cp.id),
    );
    const totalCount = allCheckpointIds.length;
    const doneCount = allCheckpointIds.filter((id) => checkpointStates[id] === "done").length;
    if (doneCount === 0 || doneCount >= totalCount) return null;
    return { lesson: activeLesson, doneCount, totalCount };
  })();

  return (
    <section className="home-section">
      <div className="home-sec-head">
        <h3>Pick up where you left off</h3>
      </div>
      {lessonInProgress ? (
        <ContinueLessonCard
          lesson={lessonInProgress.lesson}
          doneCount={lessonInProgress.doneCount}
          totalCount={lessonInProgress.totalCount}
        />
      ) : project ? (
        <ContinueCard project={project} />
      ) : (
        <EmptyState
          icon={<IconClock />}
          title="No project in progress"
          subtitle="Open or create a project to see it appear here."
        />
      )}
    </section>
  );
}
