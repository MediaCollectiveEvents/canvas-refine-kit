// vite.cms.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  publicDir: false,

  plugins: [react()],

  build: {
    outDir: "public/admin",
    emptyOutDir: false,
    lib: {
      entry: path.resolve(__dirname, "src/cms/preview.tsx"),
      name: "CMSPreview", // required for iife output
      formats: ["iife"], // single IIFE bundle for the CMS iframe
      fileName: () => "cms.bundle.js",
    },
    rollupOptions: {
      external: [], // bundle everything (incl. React)
      output: {
        // ✅ runs before any module code in the final bundle
        banner:
          "window.process = window.process || { env: { NODE_ENV: 'development' } };",
      },
    },
  },

  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
