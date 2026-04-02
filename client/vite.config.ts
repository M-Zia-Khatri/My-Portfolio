import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

const isProd = process.env.NODE_ENV === 'production';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@studio-freight/lenis/dist/lenis.css': path.resolve(
        __dirname,
        'node_modules/@studio-freight/lenis/dist/lenis.css',
      ),
    },
  },
  define: {
    __DEV__: JSON.stringify(!isProd),
  },
  build: {
    minify: 'esbuild',
    target: 'es2022',
    sourcemap: !isProd,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 700,

  },
});
