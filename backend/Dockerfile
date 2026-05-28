FROM node:22-alpine

RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@11.1.3 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install

COPY . .

RUN pnpm run build

EXPOSE 3000

CMD ["pnpm", "start"]