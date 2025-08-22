/*
 * @Author: Aii如樱如月 morikawa@kimisui56.work
 * @Date: 2025-01-27 10:00:00
 * @LastEditors: Aii如樱如月 morikawa@kimisui56.work
 * @LastEditTime: 2025-01-27 10:00:00
 * @FilePath: \negaihoshi\frontend\aii-home\src\config\__tests__\api.test.ts
 * @Description: API配置测试文件
 */

import { getAPIConfig } from '../api';

describe('API Configuration', () => {
  it('should return default configuration when no environment variables are set', () => {
    const config = getAPIConfig();
    
    expect(config.baseURL).toBe('http://localhost:9292/api');
    expect(config.timeout).toBe(30000);
    expect(config.debugMode).toBe(false);
    expect(config.devMode).toBe(false);
  });

  it('should handle environment variables correctly', () => {
    // 模拟环境变量
    const originalEnv = import.meta.env;
    (import.meta as any).env = {
      VITE_API_BASE_URL: 'https://test-api.example.com/api',
      VITE_API_TIMEOUT: '15000',
      VITE_DEBUG_MODE: 'true',
      VITE_DEV_MODE: 'true',
    };

    const config = getAPIConfig();
    
    expect(config.baseURL).toBe('https://test-api.example.com/api');
    expect(config.timeout).toBe(15000);
    expect(config.debugMode).toBe(true);
    expect(config.devMode).toBe(true);

    // 恢复原始环境变量
    (import.meta as any).env = originalEnv;
  });

  it('should handle invalid timeout values', () => {
    // 模拟无效的超时值
    const originalEnv = import.meta.env;
    (import.meta as any).env = {
      VITE_API_TIMEOUT: 'invalid',
    };

    const config = getAPIConfig();
    
    expect(config.timeout).toBe(30000); // 应该使用默认值

    // 恢复原始环境变量
    (import.meta as any).env = originalEnv;
  });
});
