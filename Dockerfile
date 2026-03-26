FROM php:8.4-fpm-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    nginx \
    supervisor \
    sqlite \
    sqlite-dev \
    icu-dev \
    libzip-dev \
    oniguruma-dev \
    linux-headers \
    $PHPIZE_DEPS

# Install PHP extensions
RUN docker-php-ext-install \
    pdo_sqlite \
    intl \
    zip \
    mbstring \
    opcache \
    pcntl

# Configure opcache
RUN echo "opcache.enable=1" >> /usr/local/etc/php/conf.d/opcache.ini && \
    echo "opcache.memory_consumption=128" >> /usr/local/etc/php/conf.d/opcache.ini && \
    echo "opcache.interned_strings_buffer=8" >> /usr/local/etc/php/conf.d/opcache.ini && \
    echo "opcache.max_accelerated_files=10000" >> /usr/local/etc/php/conf.d/opcache.ini && \
    echo "opcache.validate_timestamps=0" >> /usr/local/etc/php/conf.d/opcache.ini

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# ---------- Composer dependencies ----------
FROM base AS vendor

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

COPY . .
RUN composer dump-autoload --optimize

# ---------- Frontend build ----------
FROM node:22-alpine AS frontend

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
# Ziggy is imported from vendor during the Vite build
COPY --from=vendor /var/www/html/vendor/tightenco ./vendor/tightenco
RUN npm run build

# ---------- Final image ----------
FROM base AS production

# Copy application code
COPY . .

# Remove any cached service providers from local dev
RUN rm -f bootstrap/cache/*.php

# Copy vendor from composer stage
COPY --from=vendor /var/www/html/vendor ./vendor

# Copy built frontend assets
COPY --from=frontend /app/public/build ./public/build

# Copy configs
COPY docker/nginx.conf /etc/nginx/http.d/default.conf
COPY docker/supervisord.conf /etc/supervisord.conf
COPY docker/entrypoint.sh /entrypoint.sh
COPY docker/php.ini /usr/local/etc/php/conf.d/app.ini

RUN chmod +x /entrypoint.sh

# Create necessary directories and set permissions
RUN mkdir -p /var/www/html/storage/app/public \
    /var/www/html/storage/framework/cache/data \
    /var/www/html/storage/framework/sessions \
    /var/www/html/storage/framework/views \
    /var/www/html/storage/logs \
    /var/www/html/database \
    /var/run/nginx \
    /var/log/supervisor

RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache /var/www/html/database

EXPOSE 80

VOLUME ["/var/www/html/database"]

ENTRYPOINT ["/entrypoint.sh"]
CMD ["supervisord", "-c", "/etc/supervisord.conf"]
