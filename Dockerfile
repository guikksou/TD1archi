# --- Stage 1 : Build ---
FROM alpine:3.20 AS builder

WORKDIR /jesaispascequejefais

RUN apk add --no-cache nodejs npm

COPY package*.json ./
RUN npm ci

COPY . ./
RUN npm run build


# --- Stage 2 : Runtime (léger) ---
FROM alpine:3.20 AS runner

WORKDIR /jesaispascequejefais

RUN apk add --no-cache nodejs npm \
 && addgroup node \
 && adduser -S node -G node \
 && chown -R node:node /jesaispascequejefais

COPY --chown=node:node package*.json ./

USER node

RUN npm ci --omit=dev --cache /tmp/.npm

COPY --from=builder --chown=node:node /jesaispascequejefais/dist ./dist

CMD ["node", "dist/index.js"]
