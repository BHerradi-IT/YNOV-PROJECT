# Stage 1: Build React
FROM node:18-alpine AS builder
WORKDIR /app

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build || (echo "BUILD FAILED" && sleep 5)

# Stage 2: Nginx
FROM nginx:alpine

# Copy build files
COPY --from=builder /app/build /usr/share/nginx/html

# SPA config
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
