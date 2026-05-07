import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClientMiddleware } from '@/lib/supabase/client';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = await createSupabaseClientMiddleware(req, res);

  const { data, error } = await supabase.auth.getSession();
  const session = data?.session;

  if (error) {
    if (error) {
      console.error('Error fetching session:', error.message);
      return NextResponse.json(
        { message: 'Failed to authenticate' },
        { status: 500 },
      );
    }
  }

  // Give the user with session access to specific pages
  const { pathname } = req.nextUrl;
  const isPublicRoot = pathname === '/';
  const isAuthRoot = pathname.startsWith('/auth');
  const isDataMateRoot = pathname.startsWith('/datamate');
  const isWorkspace = pathname.startsWith('/workspace');

  // If there is no session
  if (!session) {
    if (isPublicRoot || isAuthRoot || isDataMateRoot) {
      return res;
    }

    return NextResponse.redirect(new URL('/', req.url));
  }

  // If there is a session
  if (session) {
    if (isWorkspace || isDataMateRoot) {
      return res;
    }

    if (isAuthRoot) {
      return NextResponse.redirect(new URL('/workspace', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
