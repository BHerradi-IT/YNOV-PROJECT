# Stage 1: Build React
FROM node:18-alpine AS builder
WORKDIR /app

ENV NODE_ENV=development

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build || (echo "BUILD FAILED" && ls -la && ls -la src && ls -la public)

# Stage 2: Nginx
FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
