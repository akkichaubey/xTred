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

  // Priority: Cloudflare > x-forwarded-for > x-real-ip
  let ip =
    cfIp ||
    (forwarded ? (forwarded.split(",")[0] ?? "").trim() || null : null) ||
    realIp;

  // If running locally (localhost / loopback / unknown), fetch public WAN IP from ipify
  if (!ip || ip === "::1" || ip === "127.0.0.1" || ip.startsWith("::ffff:127.")) {
    try {
      const res = await fetch("https://api.ipify.org?format=json", {
        cache: "no-store",
        next: { revalidate: 0 },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.ip) {
          ip = data.ip;
        }
      }
    } catch {
      ip = ip || "unknown";
    }
  }

  return NextResponse.json({ ip: ip || "unknown" });
}
