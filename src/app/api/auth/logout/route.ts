import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // Obtener la URL base del request
  const url = new URL(req.url);
  const loginUrl = `${url.protocol}//${url.host}/login`;
  const res = NextResponse.redirect(loginUrl, 303);
  res.cookies.set({ name: 'token', value: '', maxAge: 0, path: '/' });
  return res;
}
