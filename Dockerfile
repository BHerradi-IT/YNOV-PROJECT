# Use official Nginx Alpine image
FROM nginx:alpine

# Copy React build (public folder) to Nginx html folder
COPY frontend/public/ /usr/share/nginx/html/

# Copy custom Nginx config
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (mapped to host by Jenkins)
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]