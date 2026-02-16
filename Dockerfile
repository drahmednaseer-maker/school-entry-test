# Use the full Node 20 image (Debian) which includes build tools (gcc, g++, make, python)
# This avoids the heavy apt-get install step that failed in the slim image.
FROM node:20 AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
# Use npm install to ensure local compilation of better-sqlite3 for this specific OS
RUN npm install

# Copy source code
COPY . .

# Build the Next.js application
RUN npm run build

# --- Runner Stage ---
# We use the full image for the runner too to ensure all shared libraries for native modules are present
FROM node:20 AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy the standalone build if enabled, or the full project
# Since standalone is enabled in next.config.ts, we copy those results
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Ensure the data directory is present for the SQLite volume
RUN mkdir -p /app/data

EXPOSE 3000

# Start using the standalone server
CMD ["node", "server.js"]
