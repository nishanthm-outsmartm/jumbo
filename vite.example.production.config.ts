import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig(async ({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), "");

  return {
    define: {
      // Pass environment variables to the client
      "process.env.VITE_FIREBASE_API_KEY": JSON.stringify(
        env.VITE_FIREBASE_API_KEY
      ),
      "process.env.VITE_FIREBASE_APP_ID": JSON.stringify(
        env.VITE_FIREBASE_APP_ID
      ),
      "process.env.VITE_FIREBASE_PROJECT_ID": JSON.stringify(
        env.VITE_FIREBASE_PROJECT_ID
      ),
      "process.env.VITE_FRONTEND_URL": JSON.stringify(env.VITE_FRONTEND_URL),
      "process.env.VITE_API_BASE_URL": JSON.stringify(env.VITE_API_BASE_URL),
    },
    plugins: [
      react(),
      runtimeErrorOverlay(),
      ...(process.env.NODE_ENV !== "production" &&
      process.env.REPL_ID !== undefined
        ? [
            await import("@replit/vite-plugin-cartographer").then((m) =>
              m.cartographer()
            ),
          ]
        : []),
    ],
    base: "./",
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "client", "src"),
        "@shared": path.resolve(import.meta.dirname, "shared"),
        "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      },
    },
    root: path.resolve(import.meta.dirname, "client"),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
    },
    server: {
      fs: {
        strict: false,
        // deny: ["**/.*"],
        allow: [
          path.resolve(import.meta.dirname), // Allow entire project root
          path.resolve(import.meta.dirname, "client"),
          path.resolve(import.meta.dirname, "shared"),
        ],
      },
    },
  };
});
