# Deploying the dashboard

Self-hosted with Docker, behind **Pangolin** (external reverse proxy + automatic
HTTPS). The app speaks plain HTTP on port 3000; Pangolin terminates TLS and
forwards to it. The dashboard is public and read-only; only you connect Strava,
once.

## How the data flow works

- Before Strava is connected, the app serves the committed real-data snapshot
  (`src/data/snapshot.json`) — so the site always renders.
- Once you connect (below), it reads **live from Strava** via OAuth. The server
  refetches at most every ~10 minutes (ISR), so public visitors never trigger
  Strava calls directly and you stay far under the rate limit.
- Your editable config (`src/config/goals.ts`) — goal races, training block,
  manual treadmill/HYROX distance corrections, and HR zones — always layers on
  top of live data.

## 1. Register a Strava API application

At <https://www.strava.com/settings/api>:

- **Application Name**: anything (e.g. "Training Dashboard").
- **Authorization Callback Domain**: your domain only, no protocol or path —
  e.g. `dashboard.example.com`.
- Copy the **Client ID** and **Client Secret**.

## 2. Run the app container

On the VPS (Docker + Docker Compose installed):

```bash
git clone <your-repo> dashboard && cd dashboard
cp .env.example .env
# edit .env: APP_URL (https://your-domain), STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET
docker compose up -d --build
```

This starts a single `app` service listening on **`<host-ip>:3000`** over plain
HTTP. It does **not** bind ports 80/443 and does **not** manage TLS — Pangolin
does that.

## 3. Expose it through Pangolin

In Pangolin, create a resource for your domain (e.g. `dashboard.example.com`):

- **Target**: the app over HTTP — `http://<host-ip>:3000` (or the app container /
  Newt-reachable address, depending on how Newt reaches this host).
- Let Pangolin provision the TLS certificate for the domain.
- Ensure the resource's DNS for the domain is live.

The dashboard is now reachable at `https://your-domain` (showing the snapshot
until you connect Strava).

> Hardening: if Pangolin reaches the app over the local network only, you can
> bind the port to loopback by changing `ports: "3000:3000"` to
> `ports: "127.0.0.1:3000:3000"` in `docker-compose.yml` so port 3000 isn't
> exposed publicly.

## 4. Connect Strava (once)

Visit **`https://your-domain/api/strava/connect`**, approve access. You'll be
redirected back and the dashboard switches to live data within ~10 minutes (or
immediately on the next cold render). The footer shows a green "Live" dot once
connected.

The refresh token is stored on the `strava-data` Docker volume and survives
restarts/redeploys.

## Updating

```bash
git pull && docker compose up -d --build
```

## Notes

- **Rate limits**: a full render is ~12 Strava calls, cached for ~30 min, so
  steady traffic stays well under Strava's 1000-requests/day app limit (and the
  100/15-min limit). The fetch cache is persisted on the `next-cache` volume so
  an image rebuild doesn't wipe it and cold-start a burst of calls. If Strava
  ever errors (rate limit, outage, expired token) the page falls back to the
  committed snapshot instead of failing — the footer dot just shows "Snapshot".
- **All-time PRs**: Strava has no lifetime-PR endpoint, so pre-2026 bests are
  cached in `src/data/historical-best-efforts.json` and merged with recently
  fetched activities. Add older standout runs there if you want deeper history.
- **Attribution**: the footer carries "Powered by Strava" per Strava's API
  agreement — keep it.
- **Local dev**: `npm run dev` (port 3217) runs against the snapshot with no
  credentials needed.
