import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import autoprefixer from 'autoprefixer';

export default defineConfig({
  base: './',
  build: {
    outDir: './build'
  },
  server: {
    port: 3000,
    strictPort: true
  },
  plugins: [react()],
  css: {
    postcss: {
      plugins: [autoprefixer({})],
    },
  },
});
