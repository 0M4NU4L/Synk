import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  const { pathname } = request.nextUrl;

  // Allow access to the home page (login/signup) and API routes
  if (pathname === '/' || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // If no token and not on the home page, redirect to home
  if (!token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If there's a token, let them proceed
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};