import { useEffect, useMemo, useRef } from "react";

import { previewUrl } from "../../tauri/bridge";
import { vfs } from "../../vfs/VirtualFS";

const RELOAD_DEBOUNCE_MS = 300;

export function Preview() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const url = useMemo(() => previewUrl(), []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    // Reassign src with a cache-busting query string. We can't call
    // `iframe.contentWindow.location.reload()` because the iframe lives on a
    // different origin (`wecode://localhost` or `http://wecode.localhost`)
    // than the parent document, which throws a SecurityError. Setting `src`
    // navigates the iframe regardless of origin.
    const reload = () => {
      timer = null;
      const iframe = iframeRef.current;
      if (!iframe) return;
      iframe.src = `${url}?t=${Date.now()}`;
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
