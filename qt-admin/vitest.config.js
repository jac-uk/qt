import { defineConfig } from 'vitest/config';
import Vue from '@vitejs/plugin-vue';

const path = require('path');

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [Vue()],
  test: {
    globals: true,
    environment: 'jsdom',
  },
   root: '.', // Define the root
});
