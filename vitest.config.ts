import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: [
      "packages/**/__tests__/**/*.test.ts",
      "apps/web/tests/**/*.test.ts"
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"]
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "apps/web"),
      "@emotion-journey/domain": path.resolve(__dirname, "packages/domain/src/index.ts"),
      "@emotion-journey/rule-engine": path.resolve(__dirname, "packages/rule-engine/src/index.ts"),
      "@emotion-journey/analytics": path.resolve(__dirname, "packages/analytics/src/index.ts"),
      "@emotion-journey/config": path.resolve(__dirname, "packages/config/src/index.ts"),
      "@emotion-journey/ui": path.resolve(__dirname, "packages/ui/src/index.ts")
    }
  }
});
