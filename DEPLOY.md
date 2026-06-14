# Deploying the dashboard

Self-hosted with Docker + Caddy (automatic HTTPS). The dashboard is public and
read-only; only you connect Strava, once.

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

## 2. Point a domain at your server

Create an A record for your (sub)domain → your VPS public IP. Make sure ports
**80** and **443** are open.

## 3. Configure and run

On the VPS (Docker + Docker Compose installed):

```bash
git clone <your-repo> dashboard && cd dashboard
cp .env.example .env
# edit .env: DOMAIN, APP_URL (https://DOMAIN), STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET
docker compose up -d --build
```

Caddy provisions a TLS certificate automatically. The dashboard is now live at
`https://your-domain` (showing the snapshot until you connect).

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

- **Rate limits**: ~13 Strava calls per 10-minute window — comfortably within
  Strava's 200 req/15 min.
- **All-time PRs**: Strava has no lifetime-PR endpoint, so pre-2026 bests are
  cached in `src/data/historical-best-efforts.json` and merged with recently
  fetched activities. Add older standout runs there if you want deeper history.
- **Attribution**: the footer carries "Powered by Strava" per Strava's API
  agreement — keep it.
- **Local dev**: `npm run dev` (port 3217) runs against the snapshot with no
  credentials needed.
