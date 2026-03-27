# Stage 1: build React app
FROM node:18-alpine AS builder
WORKDIR /app

# انسخ package.json و package-lock.json أولا
COPY frontend/package*.json ./

# تثبيت dependencies
RUN npm install

# انسخ باقي ملفات frontend
COPY frontend/ ./

# بناء React app
RUN npm run build

# Stage 2: Nginx
FROM nginx:alpine

# نسخ build ديال React للـ Nginx
COPY --from=builder /app/build /usr/share/nginx/html

# نسخ config ديال Nginx (إلا عندك config مخصص)
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
