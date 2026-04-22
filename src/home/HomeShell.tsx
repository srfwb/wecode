import { HomeRail } from "./rail/HomeRail";
import { HomeSearch } from "./sections/HomeSearch";

export function HomeShell() {
  return (
    <div className="home-shell">
      <HomeRail />
      <main className="home-main">
        <HomeSearch />
      </main>
    </div>
  );
}
