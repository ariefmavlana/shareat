# Local Linux build and optional runtime; no GitHub Actions or automatic deploy.
FROM node:24.19.0-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run prepare && npm run build
FROM scratch AS artifact
COPY --from=build /app/.output /output
FROM node:24.19.0-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000 NUXT_MEDIA_ROOT=/app/media
COPY --from=build --chown=node:node /app/.output ./.output
RUN mkdir -p /app/media && chown node:node /app/media
USER node
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
