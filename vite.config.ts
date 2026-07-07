import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxyTarget = env.VITE_PROXY_TARGET || "http://localhost:8000";

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    server: {
      host: true,
      port: 3000,
      watch: {
        usePolling: env.CHOKIDAR_USEPOLLING === "true",
      },
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
    build: {
      outDir: "dist",
    },
  };
});
