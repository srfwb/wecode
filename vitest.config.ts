import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    // No coverage threshold yet — the suite is seed-size. Keep a sane default
    // output so CI logs stay readable.
    reporters: ["default"],
  },
});
