import { LESSONS } from "../../lessons/data";
import { useLessonStore } from "../../lessons/lessonStore";
import { useHomeStore } from "../homeStore";
import { IconBook, IconGear, IconHome, IconLightning, IconList } from "../icons";
import { HomeNavItem } from "./HomeNavItem";

export function HomeNav() {
  const tab = useHomeStore((s) => s.tab);
  const setTab = useHomeStore((s) => s.setTab);
  const checkpointStates = useLessonStore((s) => s.checkpointStates);
  const activeLessonId = useLessonStore((s) => s.activeLessonId);

  const completed = LESSONS.filter((lesson) => {
    if (lesson.id !== activeLessonId) return false;
    const allIds = lesson.steps.flatMap((step) => step.checkpoints.map((cp) => cp.id));
    return allIds.length > 0 && allIds.every((id) => checkpointStates[id] === "done");
  }).length;

  return (
    <nav className="home-nav" aria-label="Navigation principale">
      <HomeNavItem
        icon={<IconHome />}
        label="Accueil"
        active={tab === "accueil"}
        onClick={() => setTab("accueil")}
      />
      <HomeNavItem
        icon={<IconBook />}
        label="Leçons"
        active={tab === "lessons"}
        onClick={() => setTab("lessons")}
        counter={`${completed} / ${LESSONS.length}`}
      />
      <HomeNavItem
        icon={<IconLightning />}
        label="Challenges"
        active={tab === "challenges"}
        onClick={() => setTab("challenges")}
      />
      <HomeNavItem icon={<IconList />} label="Cheatsheets" />
      <HomeNavItem icon={<IconGear />} label="Settings" />
    </nav>
  );
}
