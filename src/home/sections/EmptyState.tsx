import type { ReactElement } from "react";

interface Props {
  icon: ReactElement;
  title: string;
  subtitle: string;
}

export function EmptyState({ icon, title, subtitle }: Props) {
  return (
    <div className="home-empty" role="status">
      <div className="home-empty-icon" aria-hidden="true">
        {icon}
      </div>
      <div className="home-empty-title">{title}</div>
      <div className="home-empty-sub">{subtitle}</div>
    </div>
  );
}
