import axios from 'axios';

// 定义API响应的通用类型
export interface APIResponse<T = unknown> {
  code: number;
  message: string;
  data?: T;
}

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: 'http://localhost:9292/api', // 基础 URL
  timeout: 30000,   // 增加超时时间到30秒，特别是文件上传
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 启用跨域请求携带凭证
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证信息等
    console.log('发送请求:', config.method?.toUpperCase(), config.url, config.data);
    return config;
  },
  (error) => {
    console.error('请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    const { status, data, config } = response;
    console.log('收到响应:', status, config.url, data);

    // 标准化无内容/空响应（例如 204 或后端未返回包裹结构）
    if (status === 204 || data === '' || data === undefined || data === null) {
      const normalized: APIResponse<null> = { code: 200, message: 'OK', data: null };
      return normalized;
    }

    // 如果后端已是标准结构，直接返回
    if (typeof data === 'object' && data !== null && 'code' in data) {
      return data;
    }

    // 否则包裹为标准结构
    const wrapped: APIResponse = { code: 200, message: 'OK', data };
    return wrapped;
  },
  (error) => {
    console.error('API 错误详情:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data
      }
    });

    // 统一错误处理
    if (error.response) {
      // 服务器返回了错误状态码
      const { status, data } = error.response;

      // 如果后端返回了结构化的错误信息，使用它
      if (data && typeof data === 'object') {
        return Promise.reject({
          code: data.code ?? status,
          message: data.message || `请求失败 (${status})`,
          data: data.data ?? null,
          details: {
            status,
            statusText: error.response.statusText,
            url: error.config?.url
          }
        } as APIResponse);
      }

      // 否则返回通用的错误信息
      return Promise.reject({
        code: status,
        message: `请求失败 (${status}): ${error.response.statusText || '未知错误'}`,
        data: null,
        details: {
          status,
          statusText: error.response.statusText,
          url: error.config?.url
        }
      } as APIResponse);
    } else if (error.request) {
      // 请求已发出但没有收到响应（网络层或CORS阻断）
      console.error('API 请求超时或无响应:', error.request);
      return Promise.reject({
        code: 0,
        message: '网络连接失败，请检查网络设置或服务器状态',
        data: null,
        details: {
          error: 'REQUEST_TIMEOUT',
          message: error.message,
          url: error.config?.url,
        }
      } as APIResponse);
    } else {
      // 请求配置出错
      console.error('API 请求配置错误:', error.message);
      return Promise.reject({
        code: 0,
        message: `请求配置错误: ${error.message}`,
        data: null,
        details: {
          error: 'CONFIG_ERROR',
          message: error.message,
          url: error.config?.url,
        }
      } as APIResponse);
    }
  }
);

export default apiClient;
