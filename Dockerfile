FROM node:22-alpine AS deps

WORKDIR /app

# Build tools are only needed if better-sqlite3 has no prebuilt binary for the platform.
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---------- Final image ----------
FROM node:22-alpine

ENV NODE_ENV=production \
    PORT=3000 \
    DB_PATH=/data/dashboardarr.db

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json server.js ./
COPY src ./src
COPY public ./public

RUN mkdir -p /data && chown node:node /data

USER node

EXPOSE 3000
VOLUME ["/data"]

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
    CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "server.js"]
