import { defineConfig } from "vite";
export default defineConfig({
  build: {
    manifest: true,
    outDir: "dist",
    rollupOptions: { input: "src/client.tsx" },
  },
  server: { middlewareMode: true },
});
