#!/bin/sh
set -e

cd /var/www/html

# Create .env from environment variables if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env from environment variables..."
    cat > .env <<EOF
APP_NAME=${APP_NAME:-Dashboardarr}
APP_ENV=${APP_ENV:-production}
APP_DEBUG=${APP_DEBUG:-false}
APP_URL=${APP_URL:-http://localhost}
APP_KEY=${APP_KEY:-}
DB_CONNECTION=${DB_CONNECTION:-sqlite}
DB_DATABASE=${DB_DATABASE:-/var/www/html/database/database.sqlite}
SESSION_DRIVER=${SESSION_DRIVER:-database}
SESSION_LIFETIME=120
CACHE_STORE=${CACHE_STORE:-database}
QUEUE_CONNECTION=${QUEUE_CONNECTION:-sync}
EOF
fi

# Generate APP_KEY if not set
if ! grep -q "APP_KEY=base64:" .env 2>/dev/null; then
    echo "Generating application key..."
    php artisan key:generate --force
fi

# Create SQLite database if it doesn't exist
DB_PATH="${DB_DATABASE:-/var/www/html/database/database.sqlite}"
if [ ! -f "$DB_PATH" ]; then
    echo "Creating SQLite database..."
    touch "$DB_PATH"
    chown www-data:www-data "$DB_PATH"
fi

# Run migrations
echo "Running migrations..."
php artisan migrate --force

# Cache config and routes for production
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Fix permissions
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache /var/www/html/database

echo "Dashboardarr is starting..."

exec "$@"
