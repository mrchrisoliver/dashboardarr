# Dashboardarr

A minimalistic, self-hosted dashboard for organizing bookmarks to your self-hosted applications. Inspired by [Homepage](https://github.com/gethomepage/homepage).

![Laravel](https://img.shields.io/badge/Laravel-13-FF2D20?logo=laravel&logoColor=white)
![Vue.js](https://img.shields.io/badge/Vue.js-3-4FC08D?logo=vuedotjs&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue)

## Features

- **Bookmark Management** - Full CRUD for organizing your self-hosted services
- **Smart URL Switching** - Automatically uses internal IPs when accessed via IP, or domain names when accessed via domain
- **Icon Library** - 90+ icons for popular self-hosted services (Proxmox, Sonarr, Radarr, Plex, Jellyfin, Nginx Proxy Manager, qBittorrent, and more) powered by [Dashboard Icons](https://github.com/homarr-labs/dashboard-icons)
- **Authentication** - Built-in login and registration
- **Dark Theme** - Modern dark UI with glassmorphism design
- **Sortable** - Custom sort ordering for your bookmarks
- **Docker Ready** - Single-container deployment with SQLite
- **Lightweight** - No external database required

## Quick Start with Docker

Pull the pre-built image from GitHub Container Registry:

```bash
docker compose up -d
```

Or build locally:

```bash
docker compose -f docker-compose.build.yml up -d --build
```

The app will be available at `http://localhost:8080`. Visit `/register` to create your first account.

### Portainer

Add a new stack in Portainer and paste the contents of `docker-compose.yml`, or point it at this repository. The image `ghcr.io/mrchrisoliver/dashboardarr:latest` is published automatically on every push to `main` and supports both `linux/amd64` and `linux/arm64`.

### Configuration

| Environment Variable | Default | Description |
|---|---|---|
| `APP_PORT` | `8080` | Host port to expose |
| `APP_URL` | `http://localhost:8080` | Public URL of the app |
| `APP_KEY` | *(auto-generated)* | Laravel encryption key |

### Persistent Data

The SQLite database is stored in a Docker volume (`dashboardarr-data`), so your data persists across container restarts and updates.

## Local Development

### Requirements

- PHP 8.3+
- Composer
- Node.js 22+
- SQLite

### Setup

```bash
# Install dependencies
composer install
npm install

# Configure environment
cp .env.example .env
php artisan key:generate

# Create database and run migrations
touch database/database.sqlite
php artisan migrate

# Start development servers
composer run dev
```

The app will be available at `http://localhost:8000`.

## Smart URL Switching

Each bookmark has two URL fields:

- **External URL** - The public domain (e.g. `https://proxmox.example.com`)
- **Internal URL** - The local IP address (e.g. `192.168.1.100:8006`)

When you access Dashboardarr via an **IP address** (e.g. `192.168.1.50:8080`), bookmark links will use the **internal URL**. When accessed via a **domain name** (e.g. `dashboard.example.com`), links will use the **external URL**.

## Tech Stack

- **Backend** - [Laravel 13](https://laravel.com) with [Inertia.js](https://inertiajs.com)
- **Frontend** - [Vue 3](https://vuejs.org) with [Tailwind CSS](https://tailwindcss.com)
- **Database** - SQLite
- **Icons** - [Dashboard Icons](https://github.com/homarr-labs/dashboard-icons) by Homarr Labs
- **Auth** - [Laravel Breeze](https://laravel.com/docs/starter-kits)

## License

[MIT](LICENSE)
