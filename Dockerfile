# syntax=docker/dockerfile:1

# ---- deps: install production + build dependencies ----
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- builder: compile the Next.js standalone server ----
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- runner: minimal runtime image ----
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV STRAVA_TOKEN_FILE=/data/strava-token.json

# Non-root user; /data is the persisted volume for the Strava token.
RUN addgroup -g 1001 -S nodejs \
  && adduser -S nextjs -u 1001 \
  && mkdir -p /data \
  && chown -R nextjs:nodejs /data

# Next standalone output bundles the server + only the node_modules it needs.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Pre-create the fetch/data cache dir owned by the runtime user. A named volume
# mounted here (see docker-compose) inherits this ownership on first init, so
# the Strava fetch cache survives image rebuilds instead of cold-starting and
# hammering the API. Without this the volume would be root-owned and unwritable.
RUN mkdir -p /app/.next/cache && chown -R nextjs:nodejs /app/.next

USER nextjs
EXPOSE 3000
VOLUME ["/data"]
CMD ["node", "server.js"]
