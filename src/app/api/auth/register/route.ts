import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { username, password, name } = await request.json();

    // 验证用户输入
    if (!username || !password || !name) {
      return NextResponse.json(
        { message: '用户名、密码和昵称不能为空', success: false },
        { status: 400 }
      );  
    }

    // 检查用户名是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: '该用户名已被注册', success: false },
        { status: 400 }
      );
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建新用户
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name,
      },
    });

    return NextResponse.json({
      success: true,
      message: '注册成功',
      user: {
        username: user.username,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('注册错误:', error);
    return NextResponse.json(
      { message: '服务器错误', success: false },
      { status: 500 }
    );
  }
} 