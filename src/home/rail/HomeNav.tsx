import { LESSONS } from "../../lessons/data";
import { useHomeStore } from "../homeStore";
import { IconBook, IconGear, IconHome, IconLightning, IconList } from "../icons";
import { HomeNavItem } from "./HomeNavItem";

export function HomeNav() {
  const tab = useHomeStore((s) => s.tab);
  const setTab = useHomeStore((s) => s.setTab);

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
        counter={`0 / ${LESSONS.length}`}
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
