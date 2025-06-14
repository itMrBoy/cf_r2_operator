import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // 验证用户输入
    if (!username || !password) {
      return NextResponse.json(
        { message: '用户名和密码不能为空', success: false },
        { status: 400 }
      );
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json(
        { message: '用户不存在', success: false },
        { status: 404 }
      );
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { message: '密码错误', success: false },
        { status: 401 }
      );
    }

    // 生成 JWT token
    const token = jwt.sign(
      { username: user.username },
      process.env.JWT_SECRET || 'your-super-secret-key-here',
      { expiresIn: '24h' }
    );

    return NextResponse.json({
      success: true,
      message: '登录成功',
      token,
      user: {
        username: user.username,
      },
    });
  } catch (error) {
    console.error('登录错误:', error);
    return NextResponse.json(
      { message: '服务器错误', success: false },
      { status: 500 }
    );
  }
} 