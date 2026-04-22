import { HomeRail } from "./rail/HomeRail";

export function HomeShell() {
  return (
    <div className="home-shell">
      <HomeRail />
      <main className="home-main" />
    </div>
  );
}
