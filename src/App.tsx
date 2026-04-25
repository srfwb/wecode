import { LogoDefs } from "./components/LogoMark";
import { HomeShell } from "./home/HomeShell";
import { IdeShell } from "./ide/shell/IdeShell";
import { Toasts } from "./ide/shell/Toasts";
import { CommandPalette } from "./palette/CommandPalette";
import { useCommandPaletteShortcut } from "./palette/useCommandPaletteShortcut";
import { useIdeStore } from "./state/ideStore";
import "./styles/global.css";

function App() {
  const view = useIdeStore((s) => s.view);
  useCommandPaletteShortcut();
  return (
    <>
      <LogoDefs />
      {view === "home" ? <HomeShell key="home" /> : <IdeShell key="ide" />}
      <CommandPalette />
      <Toasts />
    </>
  );
}

export default App;
