# ==============================================================================
# THUNDERS GENERATIVE - MULTI-STAGE DOCKERFILE
# Description: Production-ready Dockerfile for React/Next.js UI & AI Services
# Repository: Thunders Generative
# ==============================================================================

# ------------------------------------------------------------------------------
# STAGE 1: Base Dependencies
# ------------------------------------------------------------------------------
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

# ------------------------------------------------------------------------------
# STAGE 2: Dependency Installation
# ------------------------------------------------------------------------------
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci --frozen-lockfile

# ------------------------------------------------------------------------------
# STAGE 3: Build Application
# ------------------------------------------------------------------------------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for production build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ------------------------------------------------------------------------------
# STAGE 4: Production Runner Image
# ------------------------------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root system user for security compliance
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy public assets and built standalone application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Set permissions
USER nextjs

# Expose production application port
EXPOSE 3000

# Healthcheck configuration for cluster monitoring
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Launch Next.js / React Standalone Server
CMD ["node", "server.js"]
