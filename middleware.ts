import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;

  const isAuthPage = request.nextUrl.pathname.startsWith('/login');
  
  if (
    // Public paths that need no global middleware authentication.
    // Note: /api/admin/students (GET/POST) is bypassed here because it performs 
    // fine-grained internal authentication (verifying JWT cookies or X-App-API-Key 
    // depending on the requested action like claim, reset, update, etc.).
    request.nextUrl.pathname.startsWith('/api/auth/login') ||
    request.nextUrl.pathname.startsWith('/api/auth/logout') ||
    request.nextUrl.pathname.startsWith('/api/marketplace') ||
    request.nextUrl.pathname.startsWith('/marketplace') ||
    (request.nextUrl.pathname === '/api/admin/rewards' && request.method === 'GET') ||
    (request.nextUrl.pathname === '/api/admin/students' && (request.method === 'GET' || request.method === 'POST'))
  ) {
    return NextResponse.next();
  }

  // If no token and trying to access protected route
  if (!token) {
    if (request.nextUrl.pathname.startsWith('/api-doc')) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    if (
      request.nextUrl.pathname.startsWith('/api/swagger') ||
      request.nextUrl.pathname.startsWith('/api/admin')
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!isAuthPage && (request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/api/admin'))) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // If token exists, verify it
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is missing!');
    }
    const secret = new TextEncoder().encode(jwtSecret);
    const { payload } = await jwtVerify(token, secret);
    
    const userRole = (payload.role as any)?.name;

    // Check Super Admin only routes (swagger, api-doc, and seed data)
    if (
      request.nextUrl.pathname.startsWith('/api-doc') ||
      request.nextUrl.pathname.startsWith('/api/swagger') ||
      request.nextUrl.pathname.startsWith('/api/admin/seed')
    ) {
      if (userRole !== 'Super Admin') {
        if (request.nextUrl.pathname.startsWith('/api-doc')) {
          const adminUrl = new URL('/admin', request.url);
          return NextResponse.redirect(adminUrl);
        } else {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
      }
    }

    // If verified and on login page, redirect to admin
    if (isAuthPage) {
      const adminUrl = new URL('/admin', request.url);
      return NextResponse.redirect(adminUrl);
    }

    return NextResponse.next();
  } catch (error) {
    // Invalid token
    if (request.nextUrl.pathname.startsWith('/api-doc')) {
      const loginUrl = new URL('/login', request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('auth_token');
      return response;
    }
    if (
      request.nextUrl.pathname.startsWith('/api/swagger') ||
      request.nextUrl.pathname.startsWith('/api/admin')
    ) {
      const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      response.cookies.delete('auth_token');
      return response;
    }
    if (!isAuthPage && (request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/api/admin'))) {
      const loginUrl = new URL('/login', request.url);
      // Clear invalid cookie
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('auth_token');
      return response;
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/admin/:path*', 
    '/api/admin/:path*', 
    '/login', 
    '/marketplace/:path*', 
    '/api/marketplace/:path*',
    '/api-doc/:path*',
    '/api/swagger/:path*'
  ],
};
