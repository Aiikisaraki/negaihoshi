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
    preview: {
      host: '0.0.0.0',
      port: 4173,
    },
    // 定义环境变量
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    },
    // 环境变量配置
    envPrefix: 'VITE_',
    // 构建配置
    build: {
      // 确保构建后的文件结构正确
      outDir: 'dist',
      assetsDir: 'assets',
      // 生成 sourcemap（生产环境可以关闭）
      sourcemap: mode === 'development',
      // 配置 rollup 选项
      rollupOptions: {
        output: {
          // 确保入口文件正确
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]'
        }
      }
    }
  }
})
