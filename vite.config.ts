import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const isVercel = !!process.env.VERCEL;
  return {
    base: isVercel ? '/' : '/attendencetracker-/',
    plugins: [react()],
  };
});
  base: '/attendencetracker-/',
  plugins: [react()],
})