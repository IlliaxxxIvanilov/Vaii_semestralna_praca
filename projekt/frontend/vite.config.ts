import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Force Vite to resolve to the single React instance in this project
// and optimize common packages to avoid duplicate copies in the dev bundle.
export default defineConfig({
  resolve: {
    alias: {
      react: path.resolve(__dirname, 'node_modules', 'react'),
      'react-dom': path.resolve(__dirname, 'node_modules', 'react-dom'),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
  plugins: [react()],
})
