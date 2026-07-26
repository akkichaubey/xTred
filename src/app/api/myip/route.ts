import { NextResponse } from "next/server";

/**
 * GET /api/myip
 * Returns the client's public IP address as seen by the server.
 * Used to display in xTred Settings so users can whitelist it on Delta Exchange.
 */
export async function GET(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfIp = request.headers.get("cf-connecting-ip");

  // Priority: Cloudflare > x-forwarded-for > x-real-ip > fallback
  const ip =
    cfIp ||
    (forwarded ? (forwarded.split(",")[0] ?? "").trim() || null : null) ||
    realIp ||
    "unknown";

  return NextResponse.json({ ip });
}
