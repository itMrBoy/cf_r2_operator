import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  // 排除登录和注册路由
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // 获取token
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json(
      { message: '登录过期，请重新登录', success: false },
      { status: 401 }
    );
  }

  const [bearer, token] = authHeader.split(' ');
  if (bearer !== 'Bearer' || !token) {
    return NextResponse.json(
      { message: 'Authorization请求头格式错误，应为: Bearer <token>', success: false },
      { status: 401 }
    );
  }

  try {
    // 验证token
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'your-super-secret-key-here'
    );
    const { payload } = await jwtVerify(token, secret);
    
    // 将用户信息添加到请求头中，方便后续使用
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.sub as string);
    requestHeaders.set('x-username', payload.username as string);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('Token验证失败:', error);
    return NextResponse.json(
      { message: '无效的token或token已过期', success: false },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: '/api/:path*',
}; 