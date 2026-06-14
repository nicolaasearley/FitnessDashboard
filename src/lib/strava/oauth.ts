import { readTokenSync, writeToken, type StoredToken } from "./token-store";

/**
 * Strava OAuth (Authorization Code flow) for a single owner athlete.
 *
 * The owner connects once via /api/strava/connect; we persist the refresh
 * token and thereafter mint short-lived access tokens on demand. Public
 * visitors never authenticate — the server renders with the owner's token.
 */

const AUTHORIZE_URL = "https://www.strava.com/oauth/authorize";
const TOKEN_URL = "https://www.strava.com/oauth/token";
const SCOPE = "read,activity:read_all,profile:read_all";

const CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;

export function isConfigured(): boolean {
  return Boolean(CLIENT_ID && CLIENT_SECRET);
}

export function authorizeUrl(redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: CLIENT_ID ?? "",
    response_type: "code",
    redirect_uri: redirectUri,
    approval_prompt: "auto",
    scope: SCOPE,
  });
  return `${AUTHORIZE_URL}?${params.toString()}`;
}

interface StravaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

async function postToken(body: Record<string, string>): Promise<StoredToken> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID ?? "",
      client_secret: CLIENT_SECRET ?? "",
      ...body,
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Strava token endpoint ${res.status}: ${await res.text()}`);
  }
  const json = (await res.json()) as StravaTokenResponse;
  return {
    access_token: json.access_token,
    refresh_token: json.refresh_token,
    expires_at: json.expires_at,
  };
}

/** Exchange an authorization code for tokens and persist them (owner connect). */
export async function exchangeCode(code: string): Promise<StoredToken> {
  const token = await postToken({ code, grant_type: "authorization_code" });
  await writeToken(token);
  return token;
}

/**
 * Returns a valid access token, refreshing (and persisting the rotated refresh
 * token) when the current one is within 5 minutes of expiry.
 */
export async function getAccessToken(): Promise<string> {
  const stored = readTokenSync();
  if (!stored) {
    throw new Error("Strava is not connected. Visit /api/strava/connect to link an account.");
  }
  const now = Math.floor(Date.now() / 1000);
  if (stored.expires_at - now > 300) {
    return stored.access_token;
  }
  const refreshed = await postToken({
    grant_type: "refresh_token",
    refresh_token: stored.refresh_token,
  });
  await writeToken(refreshed);
  return refreshed.access_token;
}
