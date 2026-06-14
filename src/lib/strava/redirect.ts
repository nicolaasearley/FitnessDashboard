/**
 * Resolves the OAuth callback URL. Prefers an explicit APP_URL (recommended in
 * production so it always matches the Strava app's Authorization Callback
 * Domain), otherwise derives it from the incoming request — honouring the
 * X-Forwarded-* headers set by the reverse proxy (Caddy) in front of the app.
 */
export function callbackUrl(req: Request): string {
  const explicit = process.env.APP_URL?.replace(/\/$/, "");
  if (explicit) return `${explicit}/api/strava/callback`;

  const url = new URL(req.url);
  const proto = req.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? url.host;
  return `${proto}://${host}/api/strava/callback`;
}
