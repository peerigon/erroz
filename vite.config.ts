import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

const CI = process.env["CI"] === "true";

export default defineConfig(({ mode }) => ({
  test: {
    env: loadEnv(mode, import.meta.dirname, ""),
    coverage: {
      enabled: CI,
      reporter: ["html", "lcov"],
      include: ["src/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    },
  },
}));
