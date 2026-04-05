# =========================
# 1. Build Stage
# =========================
FROM node:20-alpine AS builder

WORKDIR /app

# Pin pnpm version (IMPORTANT for reproducibility)
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# Copy only dependency files first (better caching)
COPY package.json pnpm-lock.yaml ./

# Install ALL deps (including dev for build)
RUN pnpm install --frozen-lockfile

# Copy rest of the source
COPY . .

# Dummy DB for Prisma generate
ENV DATABASE_URL="mysql://dummy:dummy@localhost:3306/dummy"

# Generate Prisma Client
RUN pnpm exec prisma generate

# Build TypeScript
RUN pnpm build


# =========================
# 2. Production Stage
# =========================
FROM node:20-alpine

WORKDIR /app

# Pin pnpm again (must match builder)
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# Copy only required files
COPY package.json pnpm-lock.yaml ./

# Install ONLY production deps
RUN pnpm install --frozen-lockfile --prod

# Copy built output + prisma schema
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# ✅ Generate Prisma client AGAIN (safe + required)
ENV DATABASE_URL="mysql://dummy:dummy@localhost:3306/dummy"
RUN pnpm exec prisma generate

# =========================
# 3. Startup Script
# =========================
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'set -e' >> /app/start.sh && \
    echo 'echo "Waiting for database & running migrations..."' >> /app/start.sh && \
    echo 'until pnpm exec prisma migrate deploy; do' >> /app/start.sh && \
    echo '  echo "Migration failed, retrying in 5s..."' >> /app/start.sh && \
    echo '  sleep 5' >> /app/start.sh && \
    echo 'done' >> /app/start.sh && \
    echo 'echo "Starting application..."' >> /app/start.sh && \
    echo 'exec node dist/src/server.js' >> /app/start.sh && \
    chmod +x /app/start.sh

# =========================
# 4. Runtime Config
# =========================
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["/app/start.sh"]