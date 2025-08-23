/*
 * @Author: Aii如樱如月 morikawa@kimisui56.work
 * @Date: 2025-01-27 10:00:00
 * @LastEditors: Aii如樱如月 morikawa@kimisui56.work
 * @LastEditTime: 2025-01-27 10:00:00
 * @FilePath: \negaihoshi\frontend\aii-home\src\config\api.ts
 * @Description: API配置文件，支持运行时配置和环境变量配置
 */

// API配置接口
export interface APIConfig {
  baseURL: string;
  timeout: number;
  debugMode: boolean;
  devMode: boolean;
  version: string;
  features: {
    enableAvatarUpload: boolean;
    enableBackgroundSettings: boolean;
    enableWordPressIntegration: boolean;
  };
}

// 获取运行时配置
const getRuntimeConfig = () => {
  if (typeof window !== 'undefined' && window.APP_CONFIG) {
    return window.APP_CONFIG;
  }
  return null;
};

// 从环境变量获取API配置
export const getAPIConfig = (): APIConfig => {
  const runtimeConfig = getRuntimeConfig();
  
  // 优先级：运行时配置 > 环境变量 > 默认值
  const baseURL = runtimeConfig?.API_BASE_URL || 
                  import.meta.env.VITE_API_BASE_URL || 
                  'http://localhost:9292/api';
  
  const timeout = runtimeConfig?.API_TIMEOUT || 
                  parseInt(import.meta.env.VITE_API_TIMEOUT || '30000', 10);
  
  const debugMode = runtimeConfig?.DEBUG_MODE !== undefined ? 
                    runtimeConfig.DEBUG_MODE : 
                    import.meta.env.VITE_DEBUG_MODE === 'true';
  
  const devMode = import.meta.env.VITE_DEV_MODE === 'true';
  
  const version = runtimeConfig?.VERSION || '1.0.0';
  
  const features = {
    enableAvatarUpload: runtimeConfig?.FEATURES?.enableAvatarUpload ?? true,
    enableBackgroundSettings: runtimeConfig?.FEATURES?.enableBackgroundSettings ?? true,
    enableWordPressIntegration: runtimeConfig?.FEATURES?.enableWordPressIntegration ?? true,
  };

  return {
    baseURL,
    timeout,
    debugMode,
    devMode,
    version,
    features,
  };
};

// 导出当前配置
export const apiConfig = getAPIConfig();

// 开发环境下打印配置信息
if (apiConfig.devMode || apiConfig.debugMode) {
  console.log('API Configuration:', {
    baseURL: apiConfig.baseURL,
    timeout: apiConfig.timeout,
    debugMode: apiConfig.debugMode,
    devMode: apiConfig.devMode,
    version: apiConfig.version,
    features: apiConfig.features,
    configSource: getRuntimeConfig() ? 'Runtime Config' : 'Environment Variables'
  });
}

// 导出运行时配置更新函数
export const updateRuntimeConfig = (newConfig: Partial<APIConfig>) => {
  if (typeof window !== 'undefined' && window.APP_CONFIG) {
    Object.assign(window.APP_CONFIG, newConfig);
    // 重新获取配置
    Object.assign(apiConfig, getAPIConfig());
    console.log('Runtime configuration updated:', apiConfig);
  }
};
