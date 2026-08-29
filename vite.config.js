import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'android' ? './' : mode === 'pages' ? '/PepTalk/PepTalk/' : '/PepTalk/',
  // Avoid clashing with other Vite apps in the same parent folder (e.g. SnapMap on default 4173)
  preview: { port: 4280, strictPort: false },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'recharts': ['recharts'],
          'capacitor': ['@capacitor/core', '@capacitor/local-notifications'],
        },
      },
    },
  },
}))
