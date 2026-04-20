import { useIdeStore } from "../../state/ideStore";
import { basename } from "../../vfs/paths";

export function OpenFilesTabs() {
  const openFiles = useIdeStore((s) => s.openFiles);
  const activeFile = useIdeStore((s) => s.activeFile);
  const setActiveFile = useIdeStore((s) => s.setActiveFile);
  const closeFile = useIdeStore((s) => s.closeFile);

  if (openFiles.length === 0) {
    return <div className="tabs tabs--empty">Aucun fichier ouvert</div>;
  }

  return (
    <div className="tabs">
      {openFiles.map((path) => {
        const isActive = path === activeFile;
        return (
          <div key={path} className={isActive ? "tab tab--active" : "tab"} title={path}>
            <button type="button" className="tab__label" onClick={() => setActiveFile(path)}>
              {basename(path)}
            </button>
            <button
              type="button"
              className="tab__close"
              aria-label={`Fermer ${basename(path)}`}
              onClick={(e) => {
                e.stopPropagation();
                closeFile(path);
              }}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
