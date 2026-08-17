import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import tailwindcss from "@tailwindcss/vite";

const isCapacitor = process.env.CAPACITOR_BUILD === "true";

export default defineConfig({
  tanstackStart: {
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
  nitro: isCapacitor ? false : undefined,
  vite: {
    plugins: [tailwindcss()], 
    ...(isCapacitor && {
      build: {
        outDir: "dist",
        emptyOutDir: true,
      },
    }),
  },
});