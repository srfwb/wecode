import { useState } from "react";

import { APP_VERSION } from "../../constants/version";
import { ChangelogModal } from "../sections/ChangelogModal";
import { IconHelp, IconShield } from "../icons";

export function HomeRailFoot() {
  const [showChangelog, setShowChangelog] = useState(false);

  return (
    <div className="home-rail-foot">
      <div className="home-rail-sep" aria-hidden="true" />
      <button type="button" className="home-rail-link" onClick={() => setShowChangelog(true)}>
        <IconShield />
        Nouveautés de la {APP_VERSION}
      </button>
      <a className="home-rail-link">
        <IconHelp />
        Docs et aide
      </a>
      {showChangelog && <ChangelogModal onClose={() => setShowChangelog(false)} />}
    </div>
  );
}
