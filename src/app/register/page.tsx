'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/app/apiFunc/authApi';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const response = await api.register(
      formData.username,
      formData.password,
      formData.name
    );

    if (!response.success) {
      setError(response.message || '注册失败');
      return;
    }

    // 注册成功后跳转到登录页
    router.push('/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', color: 'var(--foreground)' }} className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold" style={{ color: 'var(--foreground)' }}>
            注册新账户
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
              <label htmlFor="name" className="sr-only">
                昵称
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="theme-input w-full h-12 rounded-xl px-4 text-base transition-all focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="昵称"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
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
              data-umami-event="Signup button"
              data-umami-event-id={formData.username}
              data-umami-event-name={formData.username}
            >
              注册
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 