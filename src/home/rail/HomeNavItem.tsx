import type { ReactElement } from "react";

interface Props {
  icon: ReactElement;
  label: string;
  active?: boolean;
  onClick?: () => void;
  counter?: string;
}

export function HomeNavItem({ icon, label, active = false, onClick, counter }: Props) {
  return (
    <button
      type="button"
      className={`home-nav-item${active ? " home-nav-item--active" : ""}`}
      onClick={onClick}
      disabled={!onClick}
    >
      {icon}
      <span>{label}</span>
      {counter !== undefined && <span className="home-nav-item__counter">{counter}</span>}
    </button>
  );
}
