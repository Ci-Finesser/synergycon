import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

const protectedRoutes = ['/dashboard', '/dashboard/:path*']
const adminRoutes = ['/admin', '/admin/:path*']
const publicAdminRoutes = ['/admin/login']

/**
 * Generates a cryptographically secure random token.
 */
function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}


export async function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  
  // CSRF token handling: Ensure a token exists and pass it in a header to server components.
  let csrfToken = request.cookies.get('csrf_token')?.value;
  if (!csrfToken) {
    csrfToken = generateToken();
  }
  requestHeaders.set('x-csrf-token', csrfToken);

  // The base response object is created with the modified headers.
  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Set the CSRF cookie on the response if it was not present in the original request.
  if (!request.cookies.has('csrf_token')) {
    const isProduction = request.nextUrl.protocol === 'https:';
    response.cookies.set({
      name: 'csrf_token',
      value: csrfToken,
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });
  }
  
  const { pathname } = request.nextUrl;

  // Check protected user routes
  const isProtectedRoute = protectedRoutes.some(route => {
    const pattern = route.replace(':path*', '.*');
    return new RegExp(`^${pattern}$`).test(pathname);
  });

  if (isProtectedRoute) {
    const sessionCookie = request.cookies.get('synergycon_session');
    const supabaseSession = request.cookies.get('sb-access-token');

    if (!sessionCookie && !supabaseSession) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Check admin routes
  const isAdminRoute = adminRoutes.some(route => {
    const pattern = route.replace(':path*', '.*');
    return new RegExp(`^${pattern}$`).test(pathname);
  });

  const isPublicAdminRoute = publicAdminRoutes.includes(pathname);

  if (isAdminRoute && !isPublicAdminRoute) {
    const adminSession = request.cookies.get('synergycon_admin_session');

    if (!adminSession) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Return the potentially modified response
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}