import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    // Removed babel plugin as noted in original config — using default SWC transform
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Keep the lenis CSS alias from original config
      '@studio-freight/lenis/dist/lenis.css': path.resolve(
        __dirname,
        'node_modules/@studio-freight/lenis/dist/lenis.css',
      ),
    },
  },

  // ─── Build Configuration ──────────────────────────────────────────────────
  build: {
    target: 'es2022',

    /**
     * Warn when a chunk exceeds 500 kB gzipped.
     * Keeps the team honest about bundle size regressions.
     */
    chunkSizeWarningLimit: 500,

    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return undefined;

          // GSAP animation suite (large, stable, rarely updated)
          if (id.includes('/gsap/') || id.includes('gsap/dist')) return 'vendor-gsap';

          // Motion / Framer-Motion animation runtime
          if (id.includes('/motion/') || id.includes('framer-motion')) return 'vendor-motion';

          // React Icons — the ESM bundle is large even after tree-shaking
          if (id.includes('react-icons')) return 'vendor-icons';

          // Radix UI — theme tokens + component primitives
          if (id.includes('@radix-ui')) return 'vendor-radix';

          // TanStack Query (React Query v5)
          if (id.includes('@tanstack')) return 'vendor-query';

          // React core runtime + Router (change together, cache together)
          if (
            id.includes('react-dom') ||
            id.includes('react-router') ||
            id.includes('/react/') ||
            id.includes('react/index')
          )
            return 'vendor-react';

          // Form ecosystem (RHF + Zod + resolvers)
          if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('/zod/'))
            return 'vendor-form';

          // Zustand — tiny but keeps app chunk smaller
          if (id.includes('zustand')) return 'vendor-zustand';

          // Lenis smooth scroll
          if (id.includes('lenis')) return 'vendor-lenis';

          // clsx / tailwind-merge — utility belt
          if (id.includes('clsx') || id.includes('tailwind-merge')) return 'vendor-util';

          // Everything else (smaller libs) falls into the automatic vendor chunk
          return undefined;
        },
      },
    },
  },

  // ─── Dev Optimizations ────────────────────────────────────────────────────
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router',
      '@tanstack/react-query',
      'zustand',
      'motion',
      'gsap',
      '@radix-ui/themes',
      'axios',
    ],
  },
});
