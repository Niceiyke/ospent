FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache make gcc g++ python3

COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm install

WORKDIR /app
COPY server/ ./server/

RUN mkdir -p server/db

EXPOSE 3001

CMD ["node", "server/app.js"]
