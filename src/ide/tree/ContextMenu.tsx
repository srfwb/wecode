import { useEffect, useRef } from "react";

export interface ContextMenuItem {
  label: string;
  onSelect: () => void;
  destructive?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Auto-focus first item on open so keyboard nav starts immediately.
  useEffect(() => {
    const first = ref.current?.querySelector<HTMLButtonElement>("button");
    first?.focus();
  }, []);

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const onMenuKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const buttons = Array.from(
      ref.current?.querySelectorAll<HTMLButtonElement>("button") ?? [],
    );
    if (buttons.length === 0) return;
    const active = document.activeElement;
    const index = buttons.findIndex((b) => b === active);
    const step = e.key === "ArrowDown" ? 1 : -1;
    const next = (index === -1 ? 0 : index + step + buttons.length) % buttons.length;
    buttons[next]?.focus();
  };

  return (
    <div
      ref={ref}
      className="context-menu"
      style={{ left: x, top: y }}
      role="menu"
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={onMenuKeyDown}
    >
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          role="menuitem"
          className={
            item.destructive
              ? "context-menu__item context-menu__item--destructive"
              : "context-menu__item"
          }
          onClick={() => {
            item.onSelect();
            onClose();
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
