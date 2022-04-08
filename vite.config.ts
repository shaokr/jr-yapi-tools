import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
const path = require("path");

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    assetsInlineLimit: 0,
    lib: {
      entry: path.resolve(__dirname, "src/main.tsx"),
      formats: ["cjs"],
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true
      },
    },
  },
});
