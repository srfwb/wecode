import pkg from "../../package.json";

// Centralised app version so the StatusBar chip and the Home brand puce never
// drift from package.json. The `v` prefix follows the tag convention
// (`vMAJOR.MINOR.PATCH[-N]`).
export const APP_VERSION = `v${pkg.version}`;
