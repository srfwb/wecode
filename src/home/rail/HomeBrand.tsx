import { APP_VERSION } from "../../constants/version";

export function HomeBrand() {
  return (
    <div className="home-brand">
      <div className="brand-mark" aria-hidden="true" />
      <span className="home-brand-name">WeCode</span>
      <span className="home-brand-ver">{APP_VERSION}</span>
    </div>
  );
}
