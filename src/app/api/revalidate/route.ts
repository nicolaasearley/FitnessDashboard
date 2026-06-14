import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Forces Next.js to discard the cached dashboard render and its Strava fetches,
// so the next request re-fetches live from Strava. Safe to call without auth —
// worst case it triggers one extra Strava API call.
export async function POST() {
  revalidatePath("/");
  return NextResponse.json({ revalidated: true, at: new Date().toISOString() });
}
