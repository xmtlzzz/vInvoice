FROM node:22-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev && npm install -g gosu

COPY server/ ./server/
COPY dist/ ./dist/

RUN addgroup -g 1001 -S appgroup && \
    adduser  -u 1001 -S appuser -G appgroup

EXPOSE 3001

ENV NODE_ENV=production \
    PORT=3001 \
    DATA_DIR=/app/data

ENTRYPOINT ["/bin/sh", "/app/entrypoint.sh"]
CMD ["node", "server/server.js"]
