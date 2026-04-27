import { ProjectModalsHost } from "../projects/ui/ProjectModalsHost";
import { useHomeStore } from "./homeStore";
import { HomeRail } from "./rail/HomeRail";
import { BottomTip } from "./sections/BottomTip";
import { ChallengesListView } from "./sections/ChallengesListView";
import { ContinueSection } from "./sections/ContinueSection";
import { HomeSearch } from "./sections/HomeSearch";
import { LessonPathSection } from "./sections/LessonPathSection";
import { LessonsListView } from "./sections/LessonsListView";
import { RecentProjectsSection } from "./sections/RecentProjectsSection";
import { TemplatesSection } from "./sections/TemplatesSection";

export function HomeShell() {
  const tab = useHomeStore((s) => s.tab);

  return (
    <div className="home-shell">
      <HomeRail />
      <main className="home-main">
        {tab === "accueil" && (
          <>
            <HomeSearch />
            <ContinueSection />
            <RecentProjectsSection />
            <LessonPathSection />
            <TemplatesSection />
            <BottomTip />
          </>
        )}
        {tab === "lessons" && <LessonsListView />}
        {tab === "challenges" && <ChallengesListView />}
      </main>
      <ProjectModalsHost />
    </div>
  );
}
