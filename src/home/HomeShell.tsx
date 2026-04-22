import { HomeRail } from "./rail/HomeRail";
import { BottomTip } from "./sections/BottomTip";
import { ContinueSection } from "./sections/ContinueSection";
import { HomeSearch } from "./sections/HomeSearch";
import { LessonPathSection } from "./sections/LessonPathSection";
import { RecentProjectsSection } from "./sections/RecentProjectsSection";
import { TemplatesSection } from "./sections/TemplatesSection";

export function HomeShell() {
  return (
    <div className="home-shell">
      <HomeRail />
      <main className="home-main">
        <HomeSearch />
        <ContinueSection />
        <RecentProjectsSection />
        <LessonPathSection />
        <TemplatesSection />
        <BottomTip />
      </main>
    </div>
  );
}
