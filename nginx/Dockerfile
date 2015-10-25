# Set nginx base image
FROM nginx

# File Author / Maintainer
MAINTAINER Anand Mani Sankar

# Copy custom configuration file from the current directory
COPY nginx.conf /etc/nginx/nginx.conf

COPY server.key /etc/nginx/
COPY server.crt /etc/nginx/
