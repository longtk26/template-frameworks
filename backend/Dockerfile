FROM node:22-alpine AS base
WORKDIR /app
ENV CI=true
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts

FROM deps AS build
COPY . .
RUN pnpm build
RUN pnpm prune --prod

FROM base AS runtime
ENV NODE_ENV=production
COPY package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/drizzle ./drizzle

EXPOSE 8080

CMD ["sh", "-c", "node dist/migrate.js && node dist/main.js"]
