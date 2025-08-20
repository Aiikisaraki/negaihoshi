/*
 * @Author: Aii如樱如月 morikawa@kimisui56.work
 * @Date: 2025-08-06 21:47:24
 * @LastEditors: Aii如樱如月 morikawa@kimisui56.work
 * @LastEditTime: 2025-08-09 17:55:08
 * @FilePath: \negaihoshi\frontend\aii-home\src\requests\posts.ts
 * @Description: 文章和动态相关API
 */
import apiClient from "./api";

// API响应接口
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

// 树洞消息接口
export interface TreeHoleMessage {
  id: number;
  content: string;
  userId: number;
  ctime: string;
}

// 分页响应接口
export interface PaginatedResponse<T> {
  messages: T[];
  page: number;
  size: number;
}

// 文章与说说类型
export interface PostItem {
  id: number;
  title: string;
  content: string;
  userId: number;
}

export interface StatusItem {
  id: number;
  content: string;
  userId: number;
}

// 树洞API
export const treeholeApi = {
  // 创建树洞消息
  create: async (content: string, anonymous?: boolean): Promise<ApiResponse<TreeHoleMessage>> => {
    return apiClient.post('/treehole/create', { content, anonymous: !!anonymous });
  },

  // 游客配额
  guestQuota: async (): Promise<ApiResponse<{ limit: number; used: number; remaining: number }>> => {
    return apiClient.get('/treehole/guest-quota');
  },

  // 获取树洞消息列表
  getList: async (page: number = 1, size: number = 10): Promise<ApiResponse<PaginatedResponse<TreeHoleMessage>>> => {
    return apiClient.get(`/treehole/list?page=${page}&size=${size}`);
  },

  // 获取用户树洞消息
  getUserList: async (uid: number, page: number = 1, size: number = 10): Promise<ApiResponse<PaginatedResponse<TreeHoleMessage>>> => {
    return apiClient.get(`/treehole/list/${uid}?page=${page}&size=${size}`);
  },

  // 获取单个树洞消息
  getById: async (id: number): Promise<ApiResponse<TreeHoleMessage>> => {
    return apiClient.get(`/treehole/${id}`);
  },

  // 删除树洞消息
  delete: async (id: number): Promise<ApiResponse<null>> => {
    return apiClient.delete(`/treehole/${id}`);
  }
};

// 文章/说说 API（登录后使用）
export const postApi = {
  // 创建文章
  createPost: async (title: string, content: string, transferToWP: boolean = false): Promise<ApiResponse<unknown>> => {
    return apiClient.post('/posts/create', {
      title,
      content,
      isTransferToWordPress: transferToWP,
      isPost: true
    });
  },
  // 创建说说
  createStatus: async (content: string, transferToWP: boolean = false): Promise<ApiResponse<unknown>> => {
    return apiClient.post('/posts/create', {
      title: '',
      content,
      isTransferToWordPress: transferToWP,
      isPost: false
    });
  },
  // 获取文章列表
  getPostsList: async (): Promise<ApiResponse<PostItem[] | { posts?: PostItem[] }>> => {
    return apiClient.get('/posts/listAll?isPost=true');
  },
  // 获取说说列表
  getStatusList: async (): Promise<ApiResponse<StatusItem[] | { status?: StatusItem[] }>> => {
    return apiClient.get('/posts/listAll?isPost=false');
  },
  // 编辑文章
  editPost: async (id: number, title: string, content: string, transferToWP: boolean = false): Promise<ApiResponse<unknown>> => {
    return apiClient.patch('/posts/edit', {
      id,
      title,
      content,
      isTransferToWordPress: transferToWP,
      isPost: true
    });
  },
  // 编辑说说
  editStatus: async (id: number, content: string, transferToWP: boolean = false): Promise<ApiResponse<unknown>> => {
    return apiClient.patch('/posts/edit', {
      id,
      title: '',
      content,
      isTransferToWordPress: transferToWP,
      isPost: false
    });
  }
};

// 用户认证API
export const authApi = {
  // 用户登录
  login: async (username: string, password: string): Promise<ApiResponse<{ user_id: number; username: string; email: string }>> => {
    return apiClient.post('/users/login', { username, password });
  },

  // 用户注册
  register: async (username: string, password: string, email: string): Promise<ApiResponse<unknown>> => {
    return apiClient.post('/users/signup', { username, password, email });
  },

  // 用户注销
  logout: async (): Promise<ApiResponse<null>> => {
    return apiClient.post('/users/logout');
  }
};

// 用户资料API
export const userApi = {
  // 获取当前用户头像地址
  getAvatar: async (): Promise<ApiResponse<{ avatar_url: string }>> => {
    return apiClient.get('/users/avatar');
  },
  // 获取个人资料（当前登录用户）
  getProfile: async (): Promise<ApiResponse<{ id: number; username: string; email: string; nickname: string; bio: string; avatar: string; phone: string; location: string; website: string; ctime: string; utime: string }>> => {
    return apiClient.get('/users/profile');
  },
  // 按ID获取公开资料
  getProfileById: async (id: number): Promise<ApiResponse<{ id: number; username: string; email: string; nickname: string; bio: string; avatar: string; phone: string; location: string; website: string; ctime: string; utime: string }>> => {
    return apiClient.get(`/users/profile/${id}`);
  }
};

// WordPress站点接口
export interface WordPressSite {
  id: number;
  site_url: string;
  site_name: string;
  username: string;
  bind_time: string;
}

// WordPress API
export const wordpressApi = {
  // 绑定WordPress站点
  bind: async (siteData: {
    site_url: string;
    username: string;
    api_key: string;
    site_name?: string;
    wp_user_id?: number;
  }): Promise<ApiResponse<unknown>> => {
    return apiClient.post('/wordpress/bind', siteData);
  },

  // 获取绑定的站点列表
  getSites: async (): Promise<ApiResponse<{ sites: WordPressSite[] }>> => {
    return apiClient.get('/wordpress/sites');
  },

  // 解绑站点
  unbind: async (siteId: number): Promise<ApiResponse<null>> => {
    return apiClient.delete(`/wordpress/sites/${siteId}`);
  },

  // 转发内容到WordPress
  transfer: async (transferData: {
    content_id: number;
    content_type: 'treehole' | 'status' | 'post';
    site_ids: number[];
    title?: string;
    as_private?: boolean;
    add_signature?: boolean;
  }): Promise<ApiResponse<{ success?: boolean }>> => {
    return apiClient.post('/wordpress/transfer', transferData);
  }
};

