# Set nginx base image
FROM nginx

# File Author / Maintainer
MAINTAINER Andrey Belik

# Copy custom configuration file from the current directory
COPY nginx.conf /etc/nginx/nginx.conf
COPY server.key /etc/nginx/
COPY server.crt /etc/nginx/
COPY mime.types /etc/nginx/

# RUN mkdir -p /src/www

VOLUME /var/log/nginx/log

VOLUME /src/www
