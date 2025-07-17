import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      include: '**/*.{jsx,tsx}',
      babel: {
        plugins: [
          ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]
        ]
      }
    })
  ],
  base: '/',
  server: {
    hmr: {
      overlay: true
    },
    watch: {
      usePolling: true
    },
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'd9d75d6ea68a.ngrok-free.app',
      'd48a876efd53.ngrok-free.app'
    ]
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'pages': path.resolve(__dirname, './src/pages'),
      'components': path.resolve(__dirname, './src/components'),
      'services': path.resolve(__dirname, './src/services'),
      'contexts': path.resolve(__dirname, './src/contexts'),
      'utils': path.resolve(__dirname, './src/utils'),
      'assets': path.resolve(__dirname, './src/assets'),
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@mui/material', '@mui/icons-material']
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      }
    }
  }
})
