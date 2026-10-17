# Dashboardarr

A minimal, self-hosted dashboard of links to your homelab services. Inspired by [Homepage](https://github.com/gethomepage/homepage).

![Node.js](https://img.shields.io/badge/Node.js-22-5FA04E?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue)

## Features

- **Manage services in the UI**: add, edit and delete services without touching config files
- **Smart addresses**: open the dashboard by IP and every link uses the service's IP and port; open it by domain and every link uses the service's domain
- **Icon picker**: 100+ icons for popular self-hosted services, from [Dashboard Icons](https://github.com/homarr-labs/dashboard-icons), or type any other icon name from that set
- **Reorder**: drag services into place in edit mode, or use the arrow keys on a card's handle
- **Search**: filter services by name
- **Single container**: Node.js + SQLite, data kept in one Docker volume
- **No authentication**: meant for a trusted home network. Don't expose it to the internet without putting auth in front of it.

## Quick start with Docker

```bash
docker compose up -d --build
```

Open `http://<server-ip>:8080`. On first run, the dashboard is seeded with a few example services; delete or edit them in the UI.

### Configuration

| Variable | Default | Description |
|---|---|---|
| `APP_PORT` | `8080` | Host port (Compose only) |
| `PORT` | `3000` | Port the app listens on inside the container |
| `DB_PATH` | `/data/dashboardarr.db` | SQLite database file |
| `SEED` | `true` | Seed example services when the database is first created. Set to `false` to start empty. |

### Persistent data

The SQLite database lives in the `dashboardarr-data` volume, mounted at `/data`, so services survive restarts and image updates.

### Portainer

Add a stack that points at this repository. Portainer builds the image from the `Dockerfile` using `docker-compose.yml`.

## How addresses work

Each service has an **IP address**, an optional **port** and a **domain**.

| You open the dashboard at | Links go to |
|---|---|
| An IP or `localhost` (e.g. `http://10.0.1.50:8080`) | `http://<ip>:<port>` |
| A domain (e.g. `https://dash.example.com`) | `https://<domain>` |

If a service only has one of the two, that one is always used.

## Local development

Requires Node.js 22 or later.

```bash
npm install
npm run dev   # http://localhost:3000, restarts on change
npm test
```

The development database is created at `./data/dashboardarr.db`.

## API

All endpoints take and return JSON.

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/services` | List services in display order |
| `POST` | `/api/services` | Create a service: `{ name, icon, ip, port, domain }` |
| `PUT` | `/api/services/:id` | Update a service |
| `DELETE` | `/api/services/:id` | Delete a service |
| `PUT` | `/api/services/order` | Reorder: `{ "ids": [3, 1, 2] }` with every id once |
| `GET` | `/api/health` | Health check |

Validation errors return `422` with `{ "errors": { "<field>": "<message>" } }`.

## Tech stack

- **Backend**: [Express 5](https://expressjs.com) on Node.js 22
- **Database**: SQLite via [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
- **Frontend**: plain HTML, CSS and JavaScript, with no build step
- **Icons**: [Dashboard Icons](https://github.com/homarr-labs/dashboard-icons) by Homarr Labs

## License

MIT
