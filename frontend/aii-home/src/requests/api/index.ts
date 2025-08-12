import axios from 'axios';

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: 'http://localhost:9292/api', // 基础 URL
  timeout: 5000,   // 超时时间
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证信息等
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    // 如果响应状态码是2xx，直接返回数据
    return response.data;
  },
  (error) => {
    // 统一错误处理
    if (error.response) {
      // 服务器返回了错误状态码
      const { status, data } = error.response;
      console.error('API 响应错误:', status, data);
      
      // 如果后端返回了结构化的错误信息，使用它
      if (data && typeof data === 'object') {
        return Promise.reject({
          code: status,
          message: data.message || `请求失败 (${status})`,
          data: data.data || null
        });
      }
      
      // 否则返回通用的错误信息
      return Promise.reject({
        code: status,
        message: `请求失败 (${status})`,
        data: null
      });
    } else if (error.request) {
      // 请求已发出但没有收到响应
      console.error('API 请求超时或无响应:', error.request);
      return Promise.reject({
        code: 0,
        message: '网络连接失败，请检查网络设置',
        data: null
      });
    } else {
      // 请求配置出错
      console.error('API 请求配置错误:', error.message);
      return Promise.reject({
        code: 0,
        message: '请求配置错误',
        data: null
      });
    }
  }
);

export default apiClient;
