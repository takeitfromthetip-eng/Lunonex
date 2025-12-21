import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  publicDir: 'public',
  resolve: {
    alias: {
      'react': path.resolve('./node_modules/react'),
      'react-dom': path.resolve('./node_modules/react-dom'),
      'react/jsx-runtime': path.resolve('./node_modules/react/jsx-runtime'),
      'react/jsx-dev-runtime': path.resolve('./node_modules/react/jsx-dev-runtime')
    },
    dedupe: ['react', 'react-dom']
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: 'terser',
    sourcemap: false,
    target: 'es2015',
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
    rollupOptions: {
      input: {
        main: './index.html'
      },
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
        // Manual chunks for better caching
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('@supabase')) {
              return 'supabase-vendor';
            }
            if (id.includes('three') || id.includes('@react-three')) {
              return 'three-vendor';
            }
            if (id.includes('@stripe')) {
              return 'stripe-vendor';
            }
            if (id.includes('@tensorflow')) {
              return 'tf-vendor';
            }
            return 'vendor';
          }
          // Component chunks
          if (id.includes('src/components/')) {
            if (id.includes('admin/')) {
              return 'admin-components';
            }
            if (id.includes('CGI') || id.includes('effects/')) {
              return 'cgi-components';
            }
            if (id.includes('VR') || id.includes('AR')) {
              return 'vrar-components';
            }
          }
        }
      }
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 3, // More aggressive
        unsafe_arrows: true,
        unsafe_methods: true,
        unsafe_proto: true,
        unsafe_regexp: true
      },
      mangle: {
        safari10: true
      },
      format: {
        comments: false // Remove all comments
      }
    }
  },
  server: {
    port: 3002,
    strictPort: false,
    host: true,
    watch: {
      usePolling: true,
      interval: 1000
    }
  },
  preview: {
    port: 3002,
    host: true
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'three', '@stripe/stripe-js'],
    force: false
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
});