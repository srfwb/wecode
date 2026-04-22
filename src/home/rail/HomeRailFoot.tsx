import { IconHelp, IconShield } from "../icons";

export function HomeRailFoot() {
  return (
    <div className="home-rail-foot">
      <div className="home-rail-sep" aria-hidden="true" />
      <a className="home-rail-link">
        <IconShield />
        Nouveautés de la v0.1
      </a>
      <a className="home-rail-link">
        <IconHelp />
        Docs et aide
      </a>
    </div>
  );
}
