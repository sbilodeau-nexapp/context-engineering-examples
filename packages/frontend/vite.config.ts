import { sentryVitePlugin } from '@sentry/vite-plugin';
/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import * as path from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
    sentryVitePlugin({
      org: 'nexapp',
      project: 'base-template-frontend',
    }),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  test: {
    globals: true,
    environment: 'jsdom',
    css: false,
    include: ['**/*.spec.{ts,tsx}'],
    setupFiles: './vitest-setup.ts',
  },

  build: {
    sourcemap: true,
  },
});
