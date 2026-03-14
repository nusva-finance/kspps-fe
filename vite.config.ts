import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    
    // 👇 Tambahkan 2 baris ini untuk mengatasi error "Blocked request"
    host: true,          // Mengizinkan akses network (0.0.0.0)
    allowedHosts: true,  // Mengizinkan semua domain (termasuk .trycloudflare.com)

    proxy: {
      '/api': {
        //target: 'http://localhost:8080',
        target : 'https://relay-antonio-effectively-involves.trycloudflare.com',
        changeOrigin: true,
      },
    },
  },
})