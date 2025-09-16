import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './src/lib/auth';

// Rutas protegidas
const protectedRoutes = [
  '/api/favorite',
  '/api/reviews',
  '/api/reviews/',
  '/api/reviews/(.*)',
  '/api/book',
  '/api/book/(.*)',
  '/profiile',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Verifica si la ruta es protegida
  const isProtected = protectedRoutes.some((route) => {
    const regex = new RegExp('^' + route + '$');
    return regex.test(pathname);
  });
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get('token')?.value;
  if (!token || !verifyToken(token)) {
    // Si es API, responde 401. 
    if (pathname.startsWith('/api/')) {
      return new NextResponse(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    } 
  }
  return NextResponse.next();
}


