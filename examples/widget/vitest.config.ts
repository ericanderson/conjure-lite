import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      include: ["src/**/*"],
      exclude: ["src/schemas/**/*", "dist/", "node_modules/", "examples/"],
    },
  },
});
