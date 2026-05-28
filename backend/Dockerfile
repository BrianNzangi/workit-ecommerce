FROM node:22-alpine

WORKDIR /app/backend

RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@11.1.3 --activate

ENV NODE_ENV=production

# install deps
COPY backend/package.json ./package.json
COPY pnpm-workspace.yaml ../
COPY pnpm-lock.yaml ../
COPY packages ../packages

RUN pnpm install --frozen-lockfile=false

# source
COPY backend .

RUN pnpm build

EXPOSE 3001

CMD ["node", "dist/src/server.js"]