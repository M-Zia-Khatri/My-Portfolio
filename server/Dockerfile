# STAGE 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile
COPY . .

ENV DATABASE_URL="mysql://dummy:dummy@localhost:3306/dummy"
RUN pnpm prisma generate
RUN pnpm build

# STAGE 2: Production
FROM node:20-alpine AS runner
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

ENV NODE_ENV=production
ENV PORT=5000

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/src ./src

# RUNTIME CONFIG
EXPOSE 5000

# Healthcheck: Checks if the server is responding on port 5000
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["node", "dist/src/server.js"]