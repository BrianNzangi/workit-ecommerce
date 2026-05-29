FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@11.1.3 --activate

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# install deps
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY admin/package.json ./admin/package.json

RUN pnpm install --frozen-lockfile=false

# source
COPY admin ./admin

RUN pnpm --filter @workit/admin build

EXPOSE 3002

CMD ["pnpm", "--filter", "@workit/admin", "start"]
