import { Group, Panel, Separator } from "react-resizable-panels";

import { useIdeStore } from "../../state/ideStore";
import { CodeEditor } from "../editor/CodeEditor";
import { Preview } from "../preview/Preview";
import { OpenFilesTabs } from "../tabs/OpenFilesTabs";
import { FileTree } from "../tree/FileTree";

export function IDELayout() {
  const activeFile = useIdeStore((s) => s.activeFile);

  return (
    <Group orientation="horizontal" id="wecode-ide" className="ide">
      <Panel defaultSize={18} minSize={10} className="ide__pane ide__pane--tree">
        <FileTree />
      </Panel>

      <Separator className="ide__handle" />

      <Panel defaultSize={47} minSize={20} className="ide__pane ide__pane--editor">
        <OpenFilesTabs />
        <CodeEditor path={activeFile} />
      </Panel>

      <Separator className="ide__handle" />

      <Panel defaultSize={35} minSize={15} className="ide__pane ide__pane--preview">
        <Preview />
      </Panel>
    </Group>
  );
}
