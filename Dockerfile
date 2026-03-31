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

# Install production dependencies only (express, cors)
COPY package.json ./
RUN npm install --omit=dev

# Copy server files and built frontend
COPY server/ ./server/
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser  -u 1001 -S appuser -G appgroup
USER appuser

EXPOSE 3001

ENV NODE_ENV=production \
    PORT=3001

CMD ["node", "server/server.js"]
