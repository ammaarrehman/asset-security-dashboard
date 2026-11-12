import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/asset-security-dashboard/',
  plugins: [react(), tailwindcss()],
})
