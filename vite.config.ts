
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: process.env.ELECTRON === "true" ? "./" : "/",
  build: {
    outDir: "dist",
    assetsDir: "assets",
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: [
            '@radix-ui/react-dialog', 
            '@radix-ui/react-dropdown-menu', 
            '@radix-ui/react-toast'
          ],
        },
      },
    },
  },
  // Optimisations pour Electron
  define: {
    'process.env.ELECTRON': process.env.ELECTRON,
    // Éviter les erreurs de Node.js dans le navigateur
    'process.env.NODE_ENV': JSON.stringify(mode),
  },
  // Empêcher Vite de remplacer process.env avec import.meta.env
  esbuild: {
    define: mode === 'production' ? {
      'global': 'window'
    } : undefined,
  }
}));
