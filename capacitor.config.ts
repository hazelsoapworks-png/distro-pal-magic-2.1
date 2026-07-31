import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.salesbeat.app",
  appName: "SalesBeat",
  // TanStack Start SPA mode emits the prerendered index.html and client assets
  // under dist/client; Capacitor needs the folder containing index.html.
  webDir: "dist/client",
  bundledWebRuntime: false,
  server: {
    androidScheme: "https",
  },
};

export default config;

