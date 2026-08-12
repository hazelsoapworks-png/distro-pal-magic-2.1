import { defineConfig } from "@lovable.dev/vite-tanstack-config";

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
    plugins: [], // MCP plugin hata diya hai taaki Windows par path error na aaye
    ...(isCapacitor && {
      build: {
        outDir: "dist",
        emptyOutDir: true,
      },
    }),
  },
});