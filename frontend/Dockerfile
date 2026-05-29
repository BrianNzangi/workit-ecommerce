FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@11.1.3 --activate

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json ./

RUN pnpm install --frozen-lockfile=false

COPY . .

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "--filter", "@workit/frontend", "start"]
