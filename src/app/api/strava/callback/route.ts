import { NextResponse } from "next/server";
import { exchangeCode } from "@/lib/strava/oauth";

export const dynamic = "force-dynamic";

// Strava redirects here with ?code=... after the owner authorizes. We exchange
// it for tokens, persist them, and bounce back to the dashboard.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(new URL(`/?strava=${error ?? "denied"}`, url.origin));
  }

  try {
    await exchangeCode(code);
    return NextResponse.redirect(new URL("/?strava=connected", url.origin));
  } catch (e) {
    console.error("Strava token exchange failed:", e);
    return NextResponse.redirect(new URL("/?strava=error", url.origin));
  }
}
