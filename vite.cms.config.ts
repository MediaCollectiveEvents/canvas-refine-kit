import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),

      // Framer-motion shim for Decap
      "framer-motion": path.resolve(
        __dirname,
        "./public/cms/framer-shim.js"
      ),

      // React globals for Decap CMS v3
      react: "react",
      "react-dom": "react-dom",
    },
  },

  build: {
    // Write bundle directly into /public/admin
    outDir: "public/admin",
    emptyOutDir: false,

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
      fileName: () => "cms.bundle.js",
      formats: ["iife"],
    },
  },
});