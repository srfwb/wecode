import { useEffect, useMemo, useRef } from "react";

import { bridgeEvents, previewUrl } from "../../tauri/bridge";

export function Preview() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const url = useMemo(() => previewUrl(), []);

  useEffect(() => {
    // Reload only after the bridge confirms the latest VFS snapshot has been
    // pushed to Rust — otherwise the iframe might fetch the previous state and
    // we'd see a stale render.
    //
    // Reassign `src` with a cache-buster instead of calling
    // `iframe.contentWindow.location.reload()`: the iframe lives on a
    // different origin (`wecode://localhost` or `http://wecode.localhost`)
    // than the parent document, so cross-origin access throws SecurityError.
    const onSynced = () => {
      const iframe = iframeRef.current;
      if (!iframe) return;
      iframe.src = `${url}?t=${Date.now()}`;
    };
    bridgeEvents.addEventListener("synced", onSynced);
    return () => {
      bridgeEvents.removeEventListener("synced", onSynced);
    };
  }, [url]);

  return (
    <iframe
      ref={iframeRef}
      title="Preview WeCode"
      src={url}
      className="preview-frame"
      sandbox="allow-scripts allow-same-origin"
    />
  );
}
