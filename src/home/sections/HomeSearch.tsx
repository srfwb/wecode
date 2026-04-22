import { IconSearch } from "../icons";

export function HomeSearch() {
  return (
    <div className="home-search" role="search">
      <IconSearch />
      <input
        type="text"
        placeholder="Rechercher un projet, une leçon ou ouvrir un fichier…"
        aria-label="Rechercher"
        disabled
      />
      <span className="home-search-kbd">Ctrl K</span>
    </div>
  );
}
