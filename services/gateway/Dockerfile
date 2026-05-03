FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

FROM node:18-alpine AS final
WORKDIR /app
COPY --from=build /app .
EXPOSE 8000
CMD ["node", "-e", "require('ts-node/register'); require('./src/server.ts')"]
