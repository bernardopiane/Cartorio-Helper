import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    // index.html ships a strict CSP (no inline scripts). Dev only, React
    // Fast-Refresh injects an inline preamble that needs one — so dev relaxes
    // script-src back while the packaged build keeps the strict policy.
    ...(command === 'serve' ? [{
      name: 'dev-csp-allow-inline-script',
      apply: 'serve',
      transformIndexHtml(html) {
        return html.replace("script-src 'self'", "script-src 'self' 'unsafe-inline'");
      },
    }] : []),
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  },
}));
