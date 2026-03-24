# Stage 1: Build frontend
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package.json & install dependencies
COPY frontend/package*.json ./
RUN npm install

# Copy all frontend files
COPY frontend/ ./

# Build the React app
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy build to Nginx html folder
COPY --from=builder /app/build /usr/share/nginx/html

# SPA fallback config
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
