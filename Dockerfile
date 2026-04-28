# ---------------------------
# Stage 1: Base & Dependencies
# ---------------------------
FROM node:22-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# ---------------------------
# Stage 2: Builder
# ---------------------------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Prisma Client জেনারেট করা
RUN npx prisma generate

# Next.js বিল্ড (এটি .next/standalone তৈরি করবে)
RUN npm run build

# Custom server (server.ts) কে জাভাস্ক্রিপ্টে ট্রান্সপাইল করা
# এতে রানটাইমে tsx এর প্রয়োজন পড়বে না, সাইজ ছোট হবে।
RUN npx esbuild server.ts --bundle --platform=node --outfile=server.js --external:next --external:socket.io --external:bullmq --external:ioredis

# ---------------------------
# Stage 3: Runner (The Final Image)
# ---------------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Standalone মোডের আউটপুট ফাইলগুলো কপি করা
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# ট্রান্সপাইল করা server.js কপি করা
COPY --from=builder --chown=nextjs:nodejs /app/server.js ./server.js

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# সরাসরি নোড দিয়ে রান করা (সবচেয়ে ফাস্ট পদ্ধতি)
CMD ["node", "server.js"]