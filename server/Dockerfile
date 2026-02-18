FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache make gcc g++ python3

COPY package*.json ./
RUN npm install

# We only need the server code
COPY server/ ./server/
# Ensure db directory exists
RUN mkdir -p server/db

EXPOSE 3001

CMD ["node", "server/app.js"]
