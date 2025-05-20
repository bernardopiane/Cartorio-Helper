import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://www.transparencia.cremerj.org.br:8098',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/planejamento/registroMedico')
      }
    }
  }
});
