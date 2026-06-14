import { NextResponse } from "next/server";
import { authorizeUrl, isConfigured } from "@/lib/strava/oauth";
import { callbackUrl } from "@/lib/strava/redirect";

export const dynamic = "force-dynamic";

// Owner-only: kicks off the Strava OAuth flow. Visit this once to link the
// account; afterwards the dashboard renders publicly using the stored token.
export function GET(req: Request) {
  if (!isConfigured()) {
    return NextResponse.json(
      { error: "Strava app not configured. Set STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET." },
      { status: 500 },
    );
  }
  return NextResponse.redirect(authorizeUrl(callbackUrl(req)));
}
