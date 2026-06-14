import { existsSync, readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Persistent storage for the owner's Strava OAuth tokens.
 *
 * Self-hosted single-instance deployment, so a JSON file on a mounted Docker
 * volume is the simplest durable store. Strava access tokens expire every ~6h
 * and the refresh token can rotate, so this must survive restarts — hence a
 * file, not an env var. Point STRAVA_TOKEN_FILE at a path on a persisted volume.
 */

export interface StoredToken {
  access_token: string;
  refresh_token: string;
  /** Unix epoch seconds when the access token expires. */
  expires_at: number;
}

const TOKEN_FILE =
  process.env.STRAVA_TOKEN_FILE || path.join(process.cwd(), "data", "strava-token.json");

export function readTokenSync(): StoredToken | null {
  try {
    if (!existsSync(TOKEN_FILE)) return null;
    const raw = readFileSync(TOKEN_FILE, "utf8");
    const t = JSON.parse(raw) as StoredToken;
    return t.refresh_token ? t : null;
  } catch {
    return null;
  }
}

/** True when the owner has connected Strava (a refresh token is stored). */
export function hasTokenSync(): boolean {
  return readTokenSync() !== null;
}

export async function writeToken(token: StoredToken): Promise<void> {
  await mkdir(path.dirname(TOKEN_FILE), { recursive: true });
  await writeFile(TOKEN_FILE, JSON.stringify(token, null, 2), "utf8");
}
