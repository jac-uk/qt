import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

const path = require('path');

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setupTests.js',
  },
   root: '.', // Define the root
});
