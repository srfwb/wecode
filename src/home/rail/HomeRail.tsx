import { HomeBrand } from "./HomeBrand";
import { HomeGreeting } from "./HomeGreeting";
import { HomeNav } from "./HomeNav";
import { HomeRailFoot } from "./HomeRailFoot";

export function HomeRail() {
  return (
    <aside className="home-rail">
      <HomeBrand />
      <HomeGreeting />
      <HomeNav />
      <HomeRailFoot />
    </aside>
  );
}
