import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),

    },
  },

  build: {
    // Write bundle directly into /public/admin
    outDir: "public/admin",
    emptyOutDir: false,
    copyPublicDir: false,

    lib: {
      entry: "./src/cms/preview.tsx",
      name: "CMSPreview",
      fileName: () => "cms.bundle.js",
      formats: ["iife"],
    },
  },
});