// 运行时配置文件 - 用户可以在部署后直接修改此文件
window.APP_CONFIG = {
  // 后端API基础URL - 用户可以修改这个地址
  API_BASE_URL: 'http://localhost:9292/api',
  
  // API请求超时时间（毫秒）
  API_TIMEOUT: 30000,
  
  // 是否启用调试模式
  DEBUG_MODE: false,
  
  // 应用版本
  VERSION: '1.0.0',
  
  // 其他配置项
  FEATURES: {
    enableAvatarUpload: true,
    enableBackgroundSettings: true,
    enableWordPressIntegration: true
  }
};

// 配置验证
if (typeof window.APP_CONFIG.API_BASE_URL !== 'string' || !window.APP_CONFIG.API_BASE_URL) {
  console.error('API_BASE_URL 配置无效，请检查 config.js 文件');
}
