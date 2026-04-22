import type { ReactElement } from "react";

interface Props {
  icon: ReactElement;
  label: string;
  active?: boolean;
}

export function HomeNavItem({ icon, label, active = false }: Props) {
  return (
    <div className={`home-nav-item${active ? " home-nav-item--active" : ""}`}>
      {icon}
      <span>{label}</span>
    </div>
  );
}
