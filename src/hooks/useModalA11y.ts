import { useEffect, useRef, type RefObject } from "react";

interface UseModalA11yOptions {
  onClose: () => void;
  // Honor Escape to dismiss. Default true.
  closeOnEscape?: boolean;
  // Element to autofocus on mount. If omitted, the first focusable descendant
  // of the container is focused.
  initialFocus?: RefObject<HTMLElement | null>;
}

// Concentrates the boring-but-mandatory modal keyboard behavior: mount sends
// focus into the modal, Escape dismisses, Tab cycles inside the modal, and
// unmount restores focus to whatever had it before the modal opened.
//
// Components that render a `role="dialog"` with `aria-modal="true"` promise
// this contract to screen readers — the hook makes sure they actually honor
// it without each component reimplementing the plumbing.
export function useModalA11y<T extends HTMLElement>(
  containerRef: RefObject<T | null>,
  options: UseModalA11yOptions,
): void {
  const { onClose, closeOnEscape = true, initialFocus } = options;

  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const container = containerRef.current;
    const previouslyActive = document.activeElement as HTMLElement | null;

    // Focus priority: explicit initialFocus > first focusable descendant >
    // the container itself (so screen readers at least announce the dialog).
    const target = initialFocus?.current ?? getFirstFocusable(container) ?? container;
    target?.focus?.();

    const onKey = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !container) return;
      const focusables = getFocusableDescendants(container);
      if (focusables.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const activeEl = document.activeElement as HTMLElement | null;
      if (event.shiftKey) {
        if (activeEl === first || !container.contains(activeEl)) {
          event.preventDefault();
          last?.focus?.();
        }
      } else if (activeEl === last) {
        event.preventDefault();
        first?.focus?.();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      // Only restore focus if the previously-active element is still in the
      // DOM and not already stolen by a different component.
      if (previouslyActive && document.contains(previouslyActive)) {
        previouslyActive.focus?.();
      }
    };
    // Mount-only. onClose is proxied through a ref above so changes do not
    // re-run the mount/unmount plumbing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function getFocusableDescendants(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => !el.hasAttribute("hidden") && !(el as HTMLInputElement).disabled,
  );
}

function getFirstFocusable(container: HTMLElement | null): HTMLElement | null {
  if (!container) return null;
  const [first] = getFocusableDescendants(container);
  return first ?? null;
}
