import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * xTred Route Protection Middleware
 *
 * - All routes under /(dashboard) require authentication
 * - Unauthenticated requests redirect to /login
 * - Authenticated requests to /login redirect to /
 * - API routes under /api/cron/* require CRON_SECRET header (for Vercel Cron)
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Cron job protection ────────────────────────────────────────────────────
  if (pathname.startsWith("/api/cron/")) {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // ── Session refresh + auth guard ───────────────────────────────────────────
  const { supabaseResponse, user } = await updateSession(request);

  // Dashboard routes: require auth
  if (pathname.startsWith("/(dashboard)") || isDashboardPath(pathname)) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Login page: redirect to dashboard if already authenticated
  if (pathname === "/login" && user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return supabaseResponse;
}

/**
 * Detect dashboard paths (App Router route groups don't appear in URL)
 */
function isDashboardPath(pathname: string): boolean {
  const dashboardPaths = [
    "/",
    "/markets",
    "/macro",
    "/news",
    "/flows",
    "/derivatives",
    "/onchain",
    "/alerts",
    "/settings",
    "/journal",
  ];
  return dashboardPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|public).*)",
  ],
};
