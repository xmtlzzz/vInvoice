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

RUN npm install -g gosu && \
    addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# Copy package files for root and server
COPY --chown=appuser:appgroup package.json ./
COPY --chown=appuser:appgroup server/package.json ./server/

# Install dependencies (both root and server)
RUN npm install --omit=dev

# Copy server source
COPY --chown=appuser:appgroup server/ ./server/

# Copy built frontend
COPY --chown=appuser:appgroup --from=builder /app/dist ./dist/

# Copy entrypoint script
COPY docker-entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

EXPOSE 3001

ENV NODE_ENV=production \
    PORT=3001 \
    DATA_DIR=/app/data

ENTRYPOINT ["/bin/sh", "/app/entrypoint.sh"]
CMD ["node", "server/server.js"]
