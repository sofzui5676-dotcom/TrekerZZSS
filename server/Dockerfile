FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY server/ ./server/

RUN npm ci

EXPOSE 4000

CMD ["node", "server/server.js"]