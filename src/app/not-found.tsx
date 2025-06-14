import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';

export function NotFound() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', color: 'var(--foreground)' }} className="flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-8">页面未找到</h2>
        <p className="mb-8 theme-text-muted">抱歉，您访问的页面不存在</p>
        <Link 
          href="/"
          className="inline-block px-6 py-3 theme-button-primary font-medium rounded-md"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
} 

export default function R2DemoPage() {
    return (
        <ProtectedRoute>
            <NotFound />
        </ProtectedRoute>
    );
} 