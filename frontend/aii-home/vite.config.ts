/*
 * @Author: Aii 如樱如月 morikawa@kimisui56.work
 * @Date: 2025-04-22 21:07:50
 * @LastEditors: Aii 如樱如月 morikawa@kimisui56.work
 * @LastEditTime: 2025-04-22 21:19:40
 * @FilePath: \nekaihoshi\frontend\aii-home\vite.config.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // 允许局域网访问
    port: 5173,
    allowedHosts: [], // 可配置允许的hostname
  },
})
