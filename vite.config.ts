import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as path from "path";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "~": path.join(__dirname, "./"),
      "@": path.join(__dirname, "./src"),
    },
  },
  define: {
    "process.env.NODE_ENV": `"${process.env.NODE_ENV}"`,
  },
  optimizeDeps: {
    exclude: ["losdah"],
  },
  build: {
    assetsInlineLimit: 0,
    lib: {
      entry: path.resolve(__dirname, "src/index.tsx"),
      formats: ["cjs"],
    },
    // minify: false,
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
});
