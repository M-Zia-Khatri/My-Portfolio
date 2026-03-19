# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Set a dummy DATABASE_URL for build-time Prisma generation
ENV DATABASE_URL="mysql://dummy:dummy@localhost:3306/dummy"

# Generate Prisma Client
RUN pnpm exec prisma generate

# Compile TypeScript             ← ADD THIS
RUN pnpm build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy generated Prisma Client from builder
COPY --from=builder /app/generated ./generated

# Copy Prisma schema for runtime migrations
COPY --from=builder /app/prisma ./prisma

# Copy application code
COPY --from=builder /app/dist ./dist

# Create a startup script
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'set -e' >> /app/start.sh && \
    echo 'echo "Running database migrations..."' >> /app/start.sh && \
    echo 'exec node dist/server.js' >> /app/start.sh && \
    echo 'echo "Starting application..."' >> /app/start.sh && \
    echo 'exec node src/server.js' >> /app/start.sh && \
    chmod +x /app/start.sh

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["/app/start.sh"]