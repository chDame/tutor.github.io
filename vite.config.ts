import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Project Pages site: served at https://chdame.github.io/tutor.github.io/
export default defineConfig({
  base: '/tutor.github.io/',
  plugins: [react()],
})
