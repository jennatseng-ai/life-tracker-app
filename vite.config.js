import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Vercel 服務於根路徑 '/'; GitHub Pages 服務於 '/life-tracker-app/' 子路徑。
// Vercel 建置時會帶 VERCEL 環境變數，藉此自動切換，兩邊都能正常運作。
export default defineConfig({
  plugins: [react()],
  base: process.env.VERCEL ? '/' : '/life-tracker-app/',
})
