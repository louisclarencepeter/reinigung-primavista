import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // netlify dev proxies to 5173 (targetPort in netlify.toml); PORT lets a
    // harness move the standalone dev server when 5173 is taken.
    port: Number(process.env.PORT) || 5173,
  },
});
