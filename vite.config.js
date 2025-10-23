import { defineConfig } from 'vite';

export default defineConfig({
  clearScreen: false,
  // IMPORTANT: Use relative paths in built index.html so Electron can load assets from file://
  base: './',
  server: {
    port: 1420,
    strictPort: true,
  },
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    target: ['es2021', 'chrome100', 'safari13'],
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_DEBUG,
  },
});
