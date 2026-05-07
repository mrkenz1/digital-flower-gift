import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // GitHub Pages project sites are served from /repository-name/.
  // Change this if your repository name is different.
  base: command === "build" ? "/digital-flower-gift/" : "/",
  build: {
    chunkSizeWarningLimit: 1300,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          motion: ["framer-motion"],
          three: ["three", "@react-three/fiber", "@react-three/drei"],
        },
      },
    },
  },
}));
