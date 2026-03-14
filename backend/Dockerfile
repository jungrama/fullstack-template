FROM oven/bun:1-alpine AS base
WORKDIR /app

# Install dependencies (include dev for drizzle-kit migrate)
FROM base AS deps
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Build
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

# Production image
FROM base AS runner
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/src/db/schema ./src/db/schema
COPY package.json ./

EXPOSE 3000
CMD ["bun", "run", "start"]
