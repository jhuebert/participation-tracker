FROM nginx:alpine

# Copy static HTML to nginx default document root
COPY src/index.html /usr/share/nginx/html/index.html

# Expose port 80
EXPOSE 80

# Start nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
