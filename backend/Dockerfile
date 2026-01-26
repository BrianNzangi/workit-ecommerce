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
    pnpm install --frozen-lockfile --prod --filter=backend

FROM base AS build-deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY admin/package.json ./admin/package.json
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json
COPY packages ./packages/
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --filter=backend...

FROM base AS builder
COPY --from=build-deps /app /app
COPY backend ./backend
COPY packages ./packages
RUN pnpm --filter=backend run build

FROM node:18-alpine AS runner
RUN npm install -g pnpm@9
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/package.json ./backend/package.json
COPY pnpm-workspace.yaml package.json ./

WORKDIR /app/backend
EXPOSE 3000

CMD ["pnpm", "start"]
