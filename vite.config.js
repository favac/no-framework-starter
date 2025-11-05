import { defineConfig } from "vite";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  server: {
    port: 3000,
    open: true,
  },
  preview: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "js"),
    },
  },
});
