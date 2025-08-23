/// <reference types="vite/client" />

// 全局配置类型定义
declare global {
  interface Window {
    APP_CONFIG: {
      API_BASE_URL: string;
      API_TIMEOUT: number;
      DEBUG_MODE: boolean;
      VERSION: string;
      FEATURES: {
        enableAvatarUpload: boolean;
        enableBackgroundSettings: boolean;
        enableWordPressIntegration: boolean;
      };
    };
  }
}

export {};

// 自定义环境变量类型定义
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_TIMEOUT: string
  readonly VITE_DEBUG_MODE: string
  readonly VITE_DEV_MODE: string
  // 更多环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
