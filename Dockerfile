# --- Base Stage ---
FROM node:22-slim AS base
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

# --- Dependencies Stage ---
FROM base AS deps
# Install build tools for native modules (better-sqlite3)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

# --- Builder Stage ---
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# --- Runner Stage ---
FROM base AS runner
# runner stage environment
ENV NODE_ENV=production
# Next.js standalone needs 0.0.0.0 to be accessible externally
ENV HOSTNAME="0.0.0.0"
# Do NOT hardcode PORT here, Railway will provide it.
# If Railway doesn't provide it, server.js defaults to 3000.

# Create a non-root user
RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 nextjs

# Copy standalone output and static assets
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Ensure data directory exists for SQLite
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

USER nextjs

# Production start command
# We use the shell form or explicitly use the port if provided
CMD ["node", "server.js"]
