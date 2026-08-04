FROM node:24-alpine AS dependencies

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /workspace

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json

RUN pnpm install --frozen-lockfile --filter frontend...

FROM dependencies AS build

ARG VITE_API_URL=/api/
ENV VITE_API_URL=$VITE_API_URL

COPY apps/frontend apps/frontend

RUN pnpm --filter frontend build

FROM nginx:1.27-alpine AS runtime

COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/apps/frontend/dist/spa /usr/share/nginx/html

EXPOSE 80

