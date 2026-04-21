import { useCallback, useEffect, useMemo, useRef } from "react";

import { useIdeStore } from "../../state/ideStore";
import { bridgeEvents, previewUrl } from "../../tauri/bridge";
import { DEVICE_SIZES } from "./devices";
import { PreviewBar } from "./PreviewBar";

const PREVIEW_PATH = "/preview/index.html";

export function Preview() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const url = useMemo(() => previewUrl(), []);
  const device = useIdeStore((s) => s.previewDevice);
  const deviceSize = DEVICE_SIZES[device];

  const reload = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    iframe.src = `${url}?t=${Date.now()}`;
  }, [url]);

  useEffect(() => {
    // Reload only after the bridge confirms the latest VFS snapshot has been
    // pushed to Rust — otherwise the iframe might fetch the previous state and
    // we'd see a stale render.
    //
    // Reassign `src` with a cache-buster instead of calling
    // `iframe.contentWindow.location.reload()`: the iframe lives on a
    // different origin (`wecode://localhost` or `http://wecode.localhost`)
    // than the parent document, so cross-origin access throws SecurityError.
    bridgeEvents.addEventListener("synced", reload);
    return () => {
      bridgeEvents.removeEventListener("synced", reload);
    };
  }, [reload]);

  const frameStyle = {
    width: deviceSize.width ?? "100%",
    height: deviceSize.height ?? "100%",
  };

  return (
    <div className="prev-pane">
      <PreviewBar onRefresh={reload} path={PREVIEW_PATH} />
      <div className={device === "desktop" ? "prev-stage prev-stage--fill" : "prev-stage"}>
        <div className="prev-frame" style={frameStyle}>
          <iframe
            ref={iframeRef}
            title="Preview WeCode"
            src={url}
            className="preview-frame"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
}
