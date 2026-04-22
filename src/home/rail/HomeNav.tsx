import { IconHome } from "../icons";
import { HomeNavItem } from "./HomeNavItem";

export function HomeNav() {
  return (
    <nav className="home-nav" aria-label="Navigation principale">
      <HomeNavItem icon={<IconHome />} label="Accueil" active />
    </nav>
  );
}
