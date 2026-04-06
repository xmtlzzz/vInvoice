# Stage 1: Build frontend
FROM node:22-alpine AS builder

WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Run server
FROM node:22-alpine

WORKDIR /app

RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup && \
    apk add --no-cache gosu

# Copy and install dependencies first
COPY package.json ./
COPY server/package.json ./server/
RUN npm install --omit=dev

# Copy server source
COPY server/ ./server/

# Copy built frontend
COPY --from=builder /app/dist ./dist/

# Copy entrypoint script
COPY docker-entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

EXPOSE 3001

ENV NODE_ENV=production \
    PORT=3001 \
    DATA_DIR=/app/server

ENTRYPOINT ["/bin/sh", "/app/entrypoint.sh"]
CMD ["node", "server/server.js"]
