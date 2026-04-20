import { useIdeStore } from "../../state/ideStore";
import { basename } from "../../vfs/paths";

export function OpenFilesTabs() {
  const openFiles = useIdeStore((s) => s.openFiles);
  const activeFile = useIdeStore((s) => s.activeFile);
  const setActiveFile = useIdeStore((s) => s.setActiveFile);

  if (openFiles.length === 0) {
    return <div className="tabs tabs--empty">Aucun fichier ouvert</div>;
  }

  return (
    <div className="tabs">
      {openFiles.map((path) => (
        <button
          key={path}
          type="button"
          className={path === activeFile ? "tab tab--active" : "tab"}
          onClick={() => setActiveFile(path)}
          title={path}
        >
          {basename(path)}
        </button>
      ))}
    </div>
  );
}
