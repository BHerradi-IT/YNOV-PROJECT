# Stage 1: build React app
FROM node:18-alpine AS builder
WORKDIR /app

# انسخ package.json و package-lock.json أولاً باش نستفيد من cache
COPY frontend/package*.json ./

# نثبت dependencies
RUN npm install

# انسخ باقي ملفات frontend
COPY frontend/ ./

# نبني build
RUN npm run build

# Stage 2: Nginx
FROM nginx:alpine

# ننسخ build للـ Nginx
COPY --from=builder /app/build /usr/share/nginx/html

# ننسخ config ديال Nginx إلا عندك واحد مخصص
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
