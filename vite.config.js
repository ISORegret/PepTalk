import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'android' ? './' : '/PepTalk/',
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'recharts': ['recharts'],
          'capacitor': ['@capacitor/core', '@capacitor/android', '@capacitor/ios', '@capacitor/local-notifications', '@capacitor/status-bar'],
        },
      },
    },
  },
}))
