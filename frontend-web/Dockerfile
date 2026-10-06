# Imagen de producción de frontend-web: build con Node y contenido estático servido por nginx.
#
# El contexto de build es la RAÍZ del repositorio (la web depende de packages/*):
#   docker build -f frontend-web/Dockerfile -t vitalis-web .
#
# Las variables VITE_* se fijan al construir (quedan dentro del bundle):
#   docker build -f frontend-web/Dockerfile -t vitalis-web:qa \
#     --build-arg VITE_USE_MOCK=false \
#     --build-arg VITE_API_BASE_URL=https://kong.qa.ejemplo.co .

# Debe coincidir con .nvmrc
ARG NODE_VERSION=24

FROM node:${NODE_VERSION}-alpine AS build
WORKDIR /repo

# 1. Dependencias: solo los manifiestos, para aprovechar la caché de capas.
COPY package.json package-lock.json ./
COPY frontend-web/package.json frontend-web/
COPY frontend-mobile/package.json frontend-mobile/
COPY packages/shared/package.json packages/shared/
COPY packages/shared-react/package.json packages/shared-react/
RUN npm ci --ignore-scripts --include-workspace-root \
      --workspace frontend-web \
      --workspace @ribas/shared \
      --workspace @ribas/shared-react

# 2. Código fuente y build.
COPY packages packages
COPY frontend-web frontend-web

ARG VITE_API_BASE_URL=http://localhost:8000
ARG VITE_USE_MOCK=true
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL} \
    VITE_USE_MOCK=${VITE_USE_MOCK}

RUN npm run build --workspace frontend-web

FROM nginx:alpine AS runtime
COPY frontend-web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/frontend-web/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1
