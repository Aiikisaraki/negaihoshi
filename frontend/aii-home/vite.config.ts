/*
 * @Author: Aii 如樱如月 morikawa@kimisui56.work
 * @Date: 2025-04-22 21:07:50
 * @LastEditors: Aii如樱如月 morikawa@kimisui56.work
 * @LastEditTime: 2025-01-27 10:00:00
 * @FilePath: \nekaihoshi\frontend\aii-home\vite.config.ts
 * @Description: Vite配置文件，支持环境变量配置
 */
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: '0.0.0.0', // 允许局域网访问
      port: 5173,
      allowedHosts: [], // 可配置允许的hostname
    },
    // 定义环境变量
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    },
    // 环境变量配置
    envPrefix: 'VITE_',
  }
})
