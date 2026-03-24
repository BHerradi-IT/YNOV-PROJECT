# Base image
FROM nginx:alpine

# Set working directory
WORKDIR /usr/share/nginx/html

# Copy frontend files
COPY frontend/ ./frontend/
COPY index.html .

# Copy backend application
COPY backend/ /usr/share/nginx/backend/

# Copy custom Nginx config
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (mapped to host 8082)
EXPOSE 80

# Start Nginx (already entrypoint in nginx:alpine)
CMD ["nginx", "-g", "daemon off;"]
