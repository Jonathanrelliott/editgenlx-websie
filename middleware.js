import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from './app/lib/session';

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    const loginUrl = new URL('/auth', req.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const payload = await verifySessionToken(token);
    if (payload.role !== 'admin') {
      const loginUrl = new URL('/auth', req.url);
      loginUrl.searchParams.set('error', 'admin_only');
      const response = NextResponse.redirect(loginUrl);
      response.cookies.set(SESSION_COOKIE_NAME, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
      });
      return response;
    }

    return NextResponse.next();
  } catch {
    const loginUrl = new URL('/auth', req.url);
    loginUrl.searchParams.set('error', 'session_invalid');
    const response = NextResponse.redirect(loginUrl);
    response.cookies.set(SESSION_COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
    return response;
  }
}

export const config = {
  matcher: ['/admin/:path*'],
};
