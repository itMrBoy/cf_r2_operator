'use client';

import { ConfigProvider, App } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { ReactNode } from 'react';

interface AntdProviderProps {
  children: ReactNode;
}

export function AntdProvider({ children }: AntdProviderProps) {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 6,
        },
      }}
    >
      <App>
        {children}
      </App>
    </ConfigProvider>
  );
} 