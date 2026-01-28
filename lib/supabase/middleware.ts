import { CookieOptions, createServerClient } from "@supabase/ssr";
import { NextRequest, NextFetchEvent, NextResponse } from "next/server";
import { validateSession } from "@/lib/session-tracker";
import { detectBot, hasSuspiciousHeaders, validateBrowserSignature, logBotDetection } from "@/lib/bot-detection";

interface Cookie {
  name: string;
  value: string;
  options?: Record<string, any>;
}

interface Cookies {
  getAll(): Cookie[];
  setAll(cookiesToSet: Cookie[]): void;
}

// Helper function for security logging
function logSecurityEvent(action: string, details: Record<string, any>) {
  const timestamp = new Date().toISOString();
  console.warn(`[SECURITY] ${action}`, { timestamp, ...details });
}

export default async function proxy(request: NextRequest): Promise<NextResponse> {
  let response: NextResponse = NextResponse.next();

  const adminSession = request.cookies.get("admin_session");
  const pathname = request.nextUrl.pathname;
  const userAgent = request.headers.get("user-agent");
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";

  // ============================================
  // BOT & SCRAPER DETECTION FOR ADMIN ROUTES
  // ============================================
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    // Check for known bots/scrapers
    const botCheck = detectBot(userAgent, pathname);
    if (botCheck.isBot) {
      logBotDetection({
        userAgent,
        path: pathname,
        ip,
        reason: botCheck.reason || "Bot detected",
        severity: botCheck.severity,
      });
      return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }

    // Check for suspicious headers (proxy chains, VPNs)
    const headerCheck = hasSuspiciousHeaders(request.headers);
    if (headerCheck.isSuspicious && !adminSession) {
      logSecurityEvent("SUSPICIOUS_HEADERS_DETECTED", {
        path: pathname,
        ip,
        details: headerCheck.details,
      });
      return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }

    // Validate browser signature
    const browserCheck = validateBrowserSignature(request.headers);
    if (!browserCheck.isValid && !adminSession) {
      logSecurityEvent("INVALID_BROWSER_SIGNATURE", {
        path: pathname,
        ip,
        reason: browserCheck.reason,
      });
      return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }
  }

  // ============================================
  // ADMIN ROUTE PROTECTION
  // ============================================
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    // Allow unauthenticated access to login and 2FA setup
    const isLoginPath =
      pathname === "/admin/login" ||
      pathname === "/api/admin/login" ||
      pathname === "/admin/2fa-setup" ||
      pathname === "/api/admin/2fa";

    if (!isLoginPath) {
      // Protected admin route - verify session exists
      if (!adminSession) {
        logSecurityEvent("UNAUTHORIZED_ADMIN_ACCESS", {
          path: pathname,
          ip,
          userAgent: userAgent?.substring(0, 100),
        });

        // Redirect to login
        const url = request.nextUrl.clone();
        url.pathname = "/admin/login";
        return NextResponse.redirect(url);
      }

      // Validate session integrity
      try {
        const session = JSON.parse(adminSession.value);

        // Validate required fields exist
        if (!session.id || !session.email || !session.full_name) {
          logSecurityEvent("INVALID_SESSION_STRUCTURE", {
            path: pathname,
            userId: session.id,
            hasId: !!session.id,
            hasEmail: !!session.email,
            hasFullName: !!session.full_name,
          });

          const url = request.nextUrl.clone();
          url.pathname = "/admin/login";
          return NextResponse.redirect(url);
        }

        // Check 2FA verification status (except for 2FA setup)
        if (pathname !== "/admin/2fa-setup" && !session.twoFactorVerified) {
          logSecurityEvent("2FA_NOT_VERIFIED", {
            userId: session.id,
            path: pathname,
          });

          const url = request.nextUrl.clone();
          url.pathname = "/admin/2fa-setup";
          return NextResponse.redirect(url);
        }

        // Session is valid - allow access
      } catch (error) {
        logSecurityEvent("SESSION_PARSE_ERROR", {
          path: pathname,
          error: String(error),
        });

        const url = request.nextUrl.clone();
        url.pathname = "/admin/login";
        return NextResponse.redirect(url);
      }
    } else {
      // User is trying to access login/2FA pages
      // If they already have a valid session, redirect to dashboard
      if (adminSession) {
        try {
          const session = JSON.parse(adminSession.value);

          if (
            session.id &&
            session.email &&
            session.full_name &&
            session.twoFactorVerified
          ) {
            const url = request.nextUrl.clone();
            url.pathname = "/admin";
            return NextResponse.redirect(url);
          }
        } catch (error) {
          // Invalid session, allow access to login page
        }
      }
    }
  }

  // Redirect to admin dashboard if already logged in and trying to access login
  if (request.nextUrl.pathname === "/admin/login" && adminSession) {
    try {
      const session = JSON.parse(adminSession.value);
      // If already verified, redirect to dashboard
      if (session.twoFactorVerified) {
        const url = request.nextUrl.clone();
        url.pathname = "/admin";
        return NextResponse.redirect(url);
      }
    } catch (error) {
      console.error("Error parsing admin session for login redirect:", error);
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If Supabase is not configured, just continue without auth check
  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll(): Cookie[] {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: Cookie[]): void {
        cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
        response = NextResponse.next();
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
       remove(name: string, options:  CookieOptions) {
          request. cookies.set({ name, value: '', ... options })
          response = NextResponse.next({
            request:  {
              headers:  request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
    } as Cookies,
  });

  // Refresh session if expired
  await supabase.auth.getUser();

  return response;
}
