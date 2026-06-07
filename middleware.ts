import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from './lib/supabase/middleware';
import { createServerClient } from '@supabase/ssr';

const ADMIN_EMAIL = 'brainbroservice@gmail.com'; // 👈 replace with your email

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin route protection
  if (pathname.startsWith('/admin')) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          get: (name) => request.cookies.get(name)?.value,
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    // Not logged in → home
    if (!user) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Logged in but not admin → dashboard
    if (user.email !== ADMIN_EMAIL) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // All other routes — existing session handling untouched
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};