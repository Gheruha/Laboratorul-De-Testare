import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClientMiddleware } from '@/lib/supabase/client';

const copyResponseCookies = (
  source: NextResponse,
  destination: NextResponse,
) => {
  source.cookies.getAll().forEach(cookie => destination.cookies.set(cookie));
  return destination;
};

const clearSupabaseCookies = (req: NextRequest, res: NextResponse) => {
  req.cookies.getAll().forEach(cookie => {
    if (cookie.name.startsWith('sb-')) {
      req.cookies.delete(cookie.name);
      res.cookies.delete(cookie.name);
    }
  });
};

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = await createSupabaseClientMiddleware(req, res);

  const { pathname } = req.nextUrl;
  const isPublicRoot = pathname === '/';
  const isAuthRoot = pathname.startsWith('/auth');
  const isDataMateRoot = pathname.startsWith('/datamate');
  const isWorkspace = pathname.startsWith('/workspace');

  // getUser verifies the access token and refreshes it when possible.
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  const isMissingSession = error?.name === 'AuthSessionMissingError';

  if (error && !isMissingSession) {
    console.warn('Supabase session expired or invalid:', error.message);
    clearSupabaseCookies(req, res);

    if (isPublicRoot || isAuthRoot || isDataMateRoot) {
      return res;
    }

    const authUrl = new URL('/auth', req.url);
    authUrl.searchParams.set('mode', 'signin');
    authUrl.searchParams.set('reason', 'session-expired');
    return copyResponseCookies(res, NextResponse.redirect(authUrl));
  }

  if (!user) {
    if (isPublicRoot || isAuthRoot || isDataMateRoot) {
      return res;
    }

    const authUrl = new URL('/auth', req.url);
    authUrl.searchParams.set('mode', 'signin');
    return copyResponseCookies(res, NextResponse.redirect(authUrl));
  }

  if (isWorkspace || isDataMateRoot) {
    return res;
  }

  if (isAuthRoot) {
    return copyResponseCookies(
      res,
      NextResponse.redirect(new URL('/workspace', req.url)),
    );
  }

  return res;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
