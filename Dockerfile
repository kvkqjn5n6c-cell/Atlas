# syntax=docker/dockerfile:1

FROM node:22-slim AS base

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*

FROM base AS deps

COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS builder

COPY prisma ./prisma
RUN npx prisma generate

COPY . .
RUN npm run build

FROM base AS runner

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["sh", "-c", "npx prisma generate && if [ \"$PRISMA_MIGRATE_DEPLOY\" = \"true\" ]; then npx prisma migrate deploy; else echo 'Prisma migrate deploy skipped because PRISMA_MIGRATE_DEPLOY is not true'; fi && npm run start -- -H 0.0.0.0 -p 3000"]
