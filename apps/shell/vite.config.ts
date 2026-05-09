import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

const workspaceRoot = fileURLToPath(new URL("../..", import.meta.url));

export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@mp/design-system": fileURLToPath(new URL("../../packages/design-system/src", import.meta.url)),
      "@mp/mock-data": fileURLToPath(new URL("../../packages/mock-data/src/index.ts", import.meta.url)),
      "@mp/runtime": fileURLToPath(new URL("../../packages/runtime/src/index.tsx", import.meta.url)),
      "@mp/shared-ui": fileURLToPath(new URL("../../packages/shared-ui/src/index.tsx", import.meta.url))
    }
  },
  server: {
    host: "127.0.0.1",
    port: 4173,
    fs: {
      allow: [workspaceRoot]
    }
  },
  preview: {
    host: "127.0.0.1",
    port: 4173
  },
  build: {
    outDir: fileURLToPath(new URL("../../dist/shell", import.meta.url)),
    emptyOutDir: true
  }
});
