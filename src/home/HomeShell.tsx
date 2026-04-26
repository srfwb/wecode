import { ProjectModalsHost } from "../projects/ui/ProjectModalsHost";
import { useHomeStore } from "./homeStore";
import { HomeRail } from "./rail/HomeRail";
import { BottomTip } from "./sections/BottomTip";
import { ContinueSection } from "./sections/ContinueSection";
import { HomeSearch } from "./sections/HomeSearch";
import { LessonPathSection } from "./sections/LessonPathSection";
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
        {tab === "lessons" && <div className="home-section">Leçons — à venir dans Task 7</div>}
        {tab === "challenges" && (
          <div className="home-section">Challenges — à venir dans Task 7</div>
        )}
      </main>
      <ProjectModalsHost />
    </div>
  );
}
