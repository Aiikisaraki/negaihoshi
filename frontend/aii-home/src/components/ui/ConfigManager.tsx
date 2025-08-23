import React, { useState, useEffect } from 'react';
import { apiConfig, updateRuntimeConfig } from '../../config/api';

interface ConfigFormData {
  API_BASE_URL: string;
  API_TIMEOUT: number;
  DEBUG_MODE: boolean;
}

const ConfigManager: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<ConfigFormData>({
    API_BASE_URL: apiConfig.baseURL,
    API_TIMEOUT: apiConfig.timeout,
    DEBUG_MODE: apiConfig.debugMode,
  });
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    // 监听配置变化
    const checkDirty = () => {
      const dirty = 
        formData.API_BASE_URL !== apiConfig.baseURL ||
        formData.API_TIMEOUT !== apiConfig.timeout ||
        formData.DEBUG_MODE !== apiConfig.debugMode;
      setIsDirty(dirty);
    };

    checkDirty();
  }, [formData, apiConfig]);

  const handleInputChange = (field: keyof ConfigFormData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 更新运行时配置
    updateRuntimeConfig({
      baseURL: formData.API_BASE_URL,
      timeout: formData.API_TIMEOUT,
      debugMode: formData.DEBUG_MODE,
    });

    // 更新全局配置
    if (typeof window !== 'undefined' && window.APP_CONFIG) {
      window.APP_CONFIG.API_BASE_URL = formData.API_BASE_URL;
      window.APP_CONFIG.API_TIMEOUT = formData.API_TIMEOUT;
      window.APP_CONFIG.DEBUG_MODE = formData.DEBUG_MODE;
    }

    setIsDirty(false);
    alert('配置已更新！页面将重新加载以应用新配置。');
    window.location.reload();
  };

  const handleReset = () => {
    setFormData({
      API_BASE_URL: apiConfig.baseURL,
      API_TIMEOUT: apiConfig.timeout,
      DEBUG_MODE: apiConfig.debugMode,
    });
    setIsDirty(false);
  };

  const handleExport = () => {
    const configBlob = new Blob([
      `// 运行时配置文件 - 用户可以在部署后直接修改此文件
window.APP_CONFIG = {
  // 后端API基础URL - 用户可以修改这个地址
  API_BASE_URL: '${formData.API_BASE_URL}',
  
  // API请求超时时间（毫秒）
  API_TIMEOUT: ${formData.API_TIMEOUT},
  
  // 是否启用调试模式
  DEBUG_MODE: ${formData.DEBUG_MODE},
  
  // 应用版本
  VERSION: '${apiConfig.version}',
  
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
}`
    ], { type: 'application/javascript' });
    
    const url = URL.createObjectURL(configBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'config.js';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* 配置按钮 */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg z-50"
        title="配置管理"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* 配置弹窗 */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">配置管理</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  后端API地址
                </label>
                <input
                  type="url"
                  value={formData.API_BASE_URL}
                  onChange={(e) => handleInputChange('API_BASE_URL', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://your-api-domain.com/api"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  例如：https://api.example.com/api 或 http://192.168.1.100:9292/api
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API超时时间 (毫秒)
                </label>
                <input
                  type="number"
                  value={formData.API_TIMEOUT}
                  onChange={(e) => handleInputChange('API_TIMEOUT', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1000"
                  max="120000"
                  step="1000"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="debug-mode"
                  checked={formData.DEBUG_MODE}
                  onChange={(e) => handleInputChange('DEBUG_MODE', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="debug-mode" className="ml-2 block text-sm text-gray-700">
                  启用调试模式
                </label>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    disabled={!isDirty}
                    className={`flex-1 px-4 py-2 rounded-md text-white font-medium ${
                      isDirty 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    应用配置
                  </button>
                                  <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  title="重置配置到当前值"
                >
                  重置
                </button>
                </div>
                
                                <button
                  type="button"
                  onClick={handleExport}
                  className="w-full mt-2 px-4 py-2 border border-green-300 rounded-md text-green-700 hover:bg-green-50"
                  title="导出当前配置到config.js文件"
                >
                  导出配置文件
                </button>
              </div>
            </form>

            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <h3 className="text-sm font-medium text-gray-700 mb-2">当前配置</h3>
              <div className="text-xs text-gray-600 space-y-1">
                <div>API地址: {apiConfig.baseURL}</div>
                <div>超时时间: {apiConfig.timeout}ms</div>
                <div>调试模式: {apiConfig.debugMode ? '开启' : '关闭'}</div>
                <div>版本: {apiConfig.version}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ConfigManager;
