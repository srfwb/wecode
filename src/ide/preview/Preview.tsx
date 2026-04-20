import { useEffect, useMemo, useRef } from "react";

import { previewUrl } from "../../tauri/bridge";
import { vfs } from "../../vfs/VirtualFS";

const RELOAD_DEBOUNCE_MS = 300;

export function Preview() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const url = useMemo(() => previewUrl(), []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const reload = () => {
      timer = null;
      const iframe = iframeRef.current;
      if (!iframe) return;
      const win = iframe.contentWindow;
      if (win) {
        win.location.reload();
      } else {
        // Fallback: re-assign src
        iframe.src = url;
      }
    };
    const off = vfs.on("change", () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(reload, RELOAD_DEBOUNCE_MS);
    });
    return () => {
      if (timer) clearTimeout(timer);
      off();
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
