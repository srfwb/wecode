import { describe, expect, it } from "vitest";

import { useIdeStore } from "./ideStore";

describe("ideStore — view slot", () => {
  it("defaults to the home view", () => {
    expect(useIdeStore.getState().view).toBe("home");
  });

  it("setView flips between home and ide", () => {
    const { setView } = useIdeStore.getState();

    setView("ide");
    expect(useIdeStore.getState().view).toBe("ide");

    setView("home");
    expect(useIdeStore.getState().view).toBe("home");
  });
});
