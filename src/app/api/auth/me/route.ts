'use server';
import { NextResponse } from 'next/server';
import { getCookie } from 'cookies-next';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

export async function GET(request: Request) {
  // This is a workaround to satisfy the type checker for getCookie
  const req = {
    headers: request.headers,
    cookies: (request as any).cookies,
  } as { headers: Headers, cookies: ReadonlyRequestCookies };


  const token = getCookie('token', { req });

  if (!token) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Неверный токен' }, { status: 401 });
  }
}
