import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  server: {
    port: 10000,
    strictPort: true, // Garante que se a 10000 estiver ocupada, ele não pule pra 10001
  }
})
