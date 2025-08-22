/*
 * @Author: Aii如樱如月 morikawa@kimisui56.work
 * @Date: 2025-01-27 10:00:00
 * @LastEditors: Aii如樱如月 morikawa@kimisui56.work
 * @LastEditTime: 2025-01-27 10:00:00
 * @FilePath: \negaihoshi\frontend\aii-home\src\config\api.ts
 * @Description: API配置文件，管理API相关的环境变量和配置
 */

// API配置接口
export interface APIConfig {
  baseURL: string;
  timeout: number;
  debugMode: boolean;
  devMode: boolean;
}

// 从环境变量获取API配置
export const getAPIConfig = (): APIConfig => {
  // 获取环境变量，提供默认值
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9292/api';
  const timeout = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000', 10);
  const debugMode = import.meta.env.VITE_DEBUG_MODE === 'true';
  const devMode = import.meta.env.VITE_DEV_MODE === 'true';

  return {
    baseURL,
    timeout,
    debugMode,
    devMode,
  };
};

// 导出当前配置
export const apiConfig = getAPIConfig();

// 开发环境下打印配置信息
if (apiConfig.devMode) {
  console.log('API Configuration:', {
    baseURL: apiConfig.baseURL,
    timeout: apiConfig.timeout,
    debugMode: apiConfig.debugMode,
    devMode: apiConfig.devMode,
  });
}
