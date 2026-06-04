import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        newtab: resolve(__dirname, 'src/newtab.jsx'),
        popup: resolve(__dirname, 'src/popup.jsx'),
        background: resolve(__dirname, 'src/background.js'),
        content: resolve(__dirname, 'src/content.js')
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    },
    minify: 'terser',
    sourcemap: false,
    target: 'es2015'
  },
  define: {
    global: 'globalThis'
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
