'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/app/apiFunc/authApi';
import { setToken } from '@/utils/useToken';

interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
  };
}

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const response = await api.login(formData.username, formData.password);

    if (!response.success) {
      setError(response.message || '登录失败');
      return;
    }

    const data = response.data as LoginResponse;
    
    // 使用新的setToken方法存储token
    setToken(data.token);
    
    // 触发自定义事件通知其他组件
    window.dispatchEvent(new CustomEvent('auth-changed'));
    
    // 跳转到首页
    router.push('/');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', color: 'var(--foreground)' }} className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold" style={{ color: 'var(--foreground)' }}>
            登录账户
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="username" className="sr-only">
                用户名
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="theme-input w-full h-12 rounded-xl px-4 text-base transition-all focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="用户名"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="theme-input w-full h-12 rounded-xl px-4 text-base transition-all focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="密码"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 theme-button-primary text-sm font-medium rounded-xl"
              data-umami-event="Login button"
              data-umami-event-id={formData.username}
              data-umami-event-name={formData.username}
            >
              登录
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 