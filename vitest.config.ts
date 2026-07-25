import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  test: {
    environment: "happy-dom",
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "app/**/*.{ts,tsx}",
        "entities/**/*.{ts,tsx}",
        "features/**/*.{ts,tsx}",
        "server/**/*.{ts,tsx}",
        "shared/**/*.{ts,tsx}",
        "widgets/**/*.{ts,tsx}",
      ],
      exclude: [
        "**/*.test.{ts,tsx}",
        "**/*.d.ts",
        "**/*.types.ts",
        "**/types.ts",
        "**/index.ts",
        "app/**/layout.tsx",
        "app/**/page.tsx",
        "app/error.tsx",
        "app/not-found.tsx",
        "entities/openapi-document/model/errors.ts",
        "server/analytics/load-request-history-page.ts",
        "server/analytics/noop-request-analytics-repository.ts",
        "server/proxy/resolve-target-host.ts",
        "server/schema/create-saved-schema-repository.ts",
        "server/schema/load-saved-schema.ts",
        "server/schema/save-schema.ts",
        "shared/lib/supabase/**",
        "shared/ui/**",
        "widgets/main-editor-screen/**",
      ],
      thresholds: {
        statements: 80,
        branches: 65,
        functions: 80,
        lines: 80,
      },
    },
  },
});
