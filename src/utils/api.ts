import { getToken, removeToken } from './useToken';

const API_BASE_URL = '/api';

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}

interface ApiError {
  message: string;
  status: number;
}

// 基础请求函数
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const token = getToken();
    const headers = new Headers(options.headers || {});

    // 添加认证头 - 确保token存在且不为空
    if (token && token.trim() !== '') {
      headers.set('Authorization', `Bearer ${token}`);
      console.log('添加Authorization头:', `Bearer ${token.substring(0, 20)}...`);
    } else {
      console.log('没有找到有效的token');
    }

    // 添加内容类型头 - 只有在发送数据时才设置
    if (options.method && options.method !== 'GET' && options.body) {
      // 检查是否已经设置了Content-Type
      const existingContentType = headers.get('Content-Type');
      if (!existingContentType) {
        // 如果body是FormData，不要设置Content-Type，让浏览器自动设置
        if (!(options.body instanceof FormData)) {
          headers.set('Content-Type', 'application/json');
        }
      }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('请求失败:', response.status, data);
      // 如果是401错误，可能是token过期，清除token
      if (response.status === 401) {
        removeToken();
      }
      throw {
        message: data.message || '请求失败',
        status: response.status,
      } as ApiError;
    }

    return {
      success: true,
      data: data as T,
    };
  } catch (error) {
    console.error('API请求错误:', error);
    
    // 检查是否是我们抛出的ApiError
    if (error && typeof error === 'object' && 'message' in error && 'status' in error) {
      const apiError = error as ApiError;
      return {
        success: false,
        message: apiError.message,
      };
    }
    
    // 处理其他类型的错误（网络错误等）
    return {
      success: false,
      message: error instanceof Error ? error.message : '网络错误',
    };
  }
};
