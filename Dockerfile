FROM node:18-alpine AS builder
WORKDIR /app

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./

RUN npm run build || cat /root/.npm/_logs/*
CMD ["nginx", "-g", "daemon off;"]
