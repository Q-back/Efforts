import { defineConfig } from 'vite'
import type { ViteUserConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig(({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules/']
    },
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}']
  },
  plugins: [vue()],
  base: process.env.NODE_ENV === 'production' ? '/Efforts/' : '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
}) as ViteUserConfig)
