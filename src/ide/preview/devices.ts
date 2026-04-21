import type { PreviewDevice } from "../../state/ideStore";

export type { PreviewDevice };

export interface DeviceSize {
  /** CSS width for the preview frame. Null = fill the stage. */
  width: string | null;
  /** CSS height for the preview frame. Null = fill the stage. */
  height: string | null;
  label: string;
}

export const DEVICE_SIZES: Record<PreviewDevice, DeviceSize> = {
  mobile: { width: "390px", height: "680px", label: "Mobile" },
  desktop: { width: null, height: null, label: "Bureau" },
};

export const DEVICE_ORDER: readonly PreviewDevice[] = ["mobile", "desktop"];
