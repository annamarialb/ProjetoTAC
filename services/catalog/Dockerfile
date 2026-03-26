# Estágio 1: Build
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Estágio 2: Final (imagem leve para produção)
FROM node:18-alpine AS final
WORKDIR /app
COPY --from=build /app .
EXPOSE 3001
CMD ["node", "-e", "require('ts-node/register'); require('./src/server.ts')"]
