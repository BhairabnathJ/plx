import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/Users/theri/Documents/trials/planner-bot/wt-claude-code/src',
    },
  },
})
