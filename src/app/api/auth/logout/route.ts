'use server';
import { NextResponse } from 'next/server';
import { deleteCookie } from 'cookies-next';

export async function POST(request: Request) {
  const response = NextResponse.json({ message: 'Logged out' }, { status: 200 });
  deleteCookie('token', { req: request, res: response });
  return response;
}
