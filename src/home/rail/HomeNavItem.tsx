import type { ReactElement } from "react";

interface Props {
  icon: ReactElement;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export function HomeNavItem({ icon, label, active = false, onClick }: Props) {
  return (
    <button
      type="button"
      className={`home-nav-item${active ? " home-nav-item--active" : ""}`}
      onClick={onClick}
      disabled={!onClick}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
