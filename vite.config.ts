// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/tanstack/vite";


const isCapacitor = process.env.CAPACITOR_BUILD === "true";

export default defineConfig({
  tanstackStart: {
    // In mobile/SPA mode, drop the custom SSR server entry so TanStack Start
    // uses its default virtual server entry for the prerender preview server.
    // For full SSR deployments, keep the src/server.ts wrapper.
    ...(isCapacitor
      ? {
          spa: {
            enabled: true,
            prerender: {
              outputPath: "index.html",
            },
          },
        }
      : {
          server: { entry: "server" },
        }),
  },
  // Skip Nitro for mobile builds; we only need the static client bundle.
  nitro: isCapacitor ? false : undefined,
  vite: {
    plugins: [mcpPlugin()],
    ...(isCapacitor && {
      build: {
        outDir: "dist",
        emptyOutDir: true,
      },
    }),
  },
});

