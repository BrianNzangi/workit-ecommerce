FROM node:18-alpine AS base
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm@9
WORKDIR /app

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY admin/package.json ./admin/package.json
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json
COPY packages ./packages/

RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --prod --filter=frontend

FROM base AS build-deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY admin/package.json ./admin/package.json
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json
COPY packages ./packages/
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --filter=frontend...

FROM base AS builder
COPY --from=build-deps /app /app
COPY frontend ./frontend
COPY packages ./packages
RUN pnpm --filter=frontend run build

FROM node:18-alpine AS runner
RUN npm install -g pnpm@9
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules
COPY --from=builder /app/frontend/.next ./frontend/.next
COPY --from=builder /app/frontend/public ./frontend/public
COPY --from=builder /app/frontend/package.json ./frontend/package.json
COPY pnpm-workspace.yaml package.json ./

WORKDIR /app/frontend
EXPOSE 3000

CMD ["pnpm", "start"]
