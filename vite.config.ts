import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // sqlite-wasm ships its own .wasm and locates it via import.meta.url;
  // excluding it from pre-bundling keeps that URL resolution intact.
  optimizeDeps: {
    exclude: ['@sqlite.org/sqlite-wasm'],
  },
})
