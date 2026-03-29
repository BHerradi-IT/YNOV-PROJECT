# Stage 1: build React app
FROM node:18-alpine AS builder
WORKDIR /app

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./

# أضف هذه الأوامر لمعرفة الخطأ
RUN echo "=== Checking if build script exists ==="
RUN cat package.json | grep "build" || echo "No build script found!"

RUN echo "=== Installing dependencies ==="
RUN npm list --depth=0 || true

RUN echo "=== Attempting to build ==="
# هذا سيعرض الخطأ الكامل
RUN npm run build 2>&1 || (echo "=== Build failed with exit code $? ===" && exit 1)
