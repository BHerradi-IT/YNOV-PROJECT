FROM node:18-alpine AS builder
WORKDIR /app

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./

# طبع logs ديال build
RUN npm run build || (echo "BUILD FAILED" && exit 1)
RUN npm run build || cat /root/.npm/_logs/*
