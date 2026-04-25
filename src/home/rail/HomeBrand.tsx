import { LogoMark } from "../../components/LogoMark";
import { APP_VERSION } from "../../constants/version";

export function HomeBrand() {
  return (
    <div className="home-brand">
      <LogoMark size={26} />
      <span className="home-brand-name">WeCode</span>
      <span className="home-brand-ver">{APP_VERSION}</span>
    </div>
  );
}
