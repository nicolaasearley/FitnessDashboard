import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { exchangeCode } from "@/lib/strava/oauth";

export const dynamic = "force-dynamic";

// Strava redirects here with ?code=... after the owner authorizes. We exchange
// it for tokens, persist them, and bounce back to the dashboard.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  // Prefer explicit APP_URL so the redirect goes to the public domain even
  // when the container sees req.url as http://0.0.0.0:3000/...
  const base = (process.env.APP_URL ?? "").replace(/\/$/, "") || url.origin;

  if (error || !code) {
    return NextResponse.redirect(`${base}/?strava=${error ?? "denied"}`);
  }

  try {
    await exchangeCode(code);
    // The token now exists on disk, so the factory will pick LiveStravaSource.
    // Bust the cached snapshot render so the dashboard flips to live immediately.
    revalidatePath("/");
    return NextResponse.redirect(`${base}/?strava=connected`);
  } catch (e) {
    console.error("Strava token exchange failed:", e);
    return NextResponse.redirect(`${base}/?strava=error`);
  }
}
