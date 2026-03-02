import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "framer-motion": path.resolve(__dirname, "./src/cms/framer-shim.ts"), // ← ADD THIS
    },
  },

  build: {
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },

    lib: {
      entry: "./src/cms/preview.tsx",
      name: "CMSPreview",
      formats: ["iife"],
      fileName: "cms.bundle.js",
    },
  },
});