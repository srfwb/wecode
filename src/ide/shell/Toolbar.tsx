import { LogoMark } from "../../components/LogoMark";
import { useLessonContext } from "../../lessons/useLessonContext";
import { useIdeStore } from "../../state/ideStore";

export function Toolbar() {
  const setView = useIdeStore((s) => s.setView);
  const lessonCtx = useLessonContext();
  const handleBrandClick = lessonCtx ? () => lessonCtx.exitLesson() : () => setView("home");
  return (
    <header className="toolbar" role="banner">
      <button
        type="button"
        className="brand brand--link"
        onClick={handleBrandClick}
        aria-label="Back to home"
      >
        <LogoMark size={20} />
        <span>WeCode</span>
      </button>

      <div className="toolbar-center">
        <div className="cmd-search" role="search" aria-label="Search">
          <svg className="i" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <span>Search files, commands…</span>
          <span className="kbd">Ctrl K</span>
        </div>
      </div>

      <div className="toolbar-right">
        <button
          type="button"
          className="t-btn t-btn--disabled"
          title="Undo — coming soon"
          aria-label="Undo — coming soon"
          disabled
        >
          <svg className="i" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 14 4 9l5-5" />
            <path d="M4 9h10a6 6 0 0 1 0 12h-3" />
          </svg>
        </button>
        <button
          type="button"
          className="t-btn t-btn--disabled"
          title="Format — coming soon"
          aria-label="Format — coming soon"
          disabled
        >
          <svg className="i" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 6h16M4 12h10M4 18h16" />
          </svg>
        </button>
        <div className="avatar" aria-hidden="true">
          WC
        </div>
      </div>
    </header>
  );
}
