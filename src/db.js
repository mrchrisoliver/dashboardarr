import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

const SEED = [
    { name: 'Proxmox', icon: 'proxmox', ip: '10.0.1.201', port: 8006, domain: 'proxmox.onlylabs.lol' },
    { name: 'Pulse', icon: 'pulse', ip: '10.0.1.202', port: null, domain: 'pulse.onlylabs.lol' },
    { name: 'Jellyfin', icon: 'jellyfin', ip: '10.0.1.201', port: 8096, domain: 'jellyfin.onlylabs.lol' },
    { name: 'Jellyseerr', icon: 'jellyseerr', ip: '10.0.1.201', port: 5055, domain: 'jellyseerr.onlylabs.lol' },
    { name: 'Home Assistant', icon: 'home-assistant', ip: '10.0.1.201', port: 8123, domain: 'home-assistant.onlylabs.lol' },
    { name: 'OpenMediaVault', icon: 'openmediavault', ip: '10.0.1.201', port: null, domain: 'openmediavault.onlylabs.lol' },
    { name: 'n8n', icon: 'n8n', ip: '10.0.1.201', port: 5678, domain: 'n8n.onlylabs.lol' },
    { name: 'Sonarr', icon: 'sonarr', ip: '10.0.1.201', port: 8989, domain: 'sonarr.onlylabs.lol' },
    { name: 'Lidarr', icon: 'lidarr', ip: '10.0.1.201', port: 8686, domain: 'lidarr.onlylabs.lol' },
    { name: 'Prowlarr', icon: 'prowlarr', ip: '10.0.1.201', port: 9696, domain: 'prowlarr.onlylabs.lol' },
    { name: 'qBittorrent', icon: 'qbittorrent', ip: '10.0.1.201', port: 8080, domain: 'qbittorrent.onlylabs.lol' },
];

const COLUMNS = 'id, name, icon, ip, port, domain, sort_order AS sortOrder';

// Opens the database, creating the schema (and seed data) on first run.
// `user_version` tracks the schema version, so deleting every service
// does not re-seed on the next start.
export function openDb(file, { seed = true } = {}) {
    if (file !== ':memory:') {
        fs.mkdirSync(path.dirname(file), { recursive: true });
    }

    const db = new Database(file);
    db.pragma('journal_mode = WAL');

    if (db.pragma('user_version', { simple: true }) === 0) {
        db.transaction(() => {
            db.exec(`
                CREATE TABLE services (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    icon TEXT NOT NULL DEFAULT '',
                    ip TEXT NOT NULL DEFAULT '',
                    port INTEGER,
                    domain TEXT NOT NULL DEFAULT '',
                    sort_order INTEGER NOT NULL DEFAULT 0,
                    created_at TEXT NOT NULL DEFAULT (datetime('now')),
                    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
                )
            `);
            if (seed) {
                const insert = db.prepare(
                    'INSERT INTO services (name, icon, ip, port, domain, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
                );
                SEED.forEach((s, i) => insert.run(s.name, s.icon, s.ip, s.port, s.domain, i));
            }
            db.pragma('user_version = 1');
        })();
    }

    return db;
}

export function createStore(db) {
    const listStmt = db.prepare(`SELECT ${COLUMNS} FROM services ORDER BY sort_order, id`);
    const getStmt = db.prepare(`SELECT ${COLUMNS} FROM services WHERE id = ?`);
    const nextOrderStmt = db.prepare('SELECT COALESCE(MAX(sort_order) + 1, 0) AS next FROM services');
    const insertStmt = db.prepare(
        'INSERT INTO services (name, icon, ip, port, domain, sort_order) VALUES (@name, @icon, @ip, @port, @domain, @sortOrder)',
    );
    const updateStmt = db.prepare(`
        UPDATE services
        SET name = @name, icon = @icon, ip = @ip, port = @port, domain = @domain, updated_at = datetime('now')
        WHERE id = @id
    `);
    const deleteStmt = db.prepare('DELETE FROM services WHERE id = ?');
    const orderStmt = db.prepare('UPDATE services SET sort_order = ? WHERE id = ?');

    return {
        list: () => listStmt.all(),

        get: (id) => getStmt.get(id),

        create(service) {
            const { next } = nextOrderStmt.get();
            const { lastInsertRowid } = insertStmt.run({ ...service, sortOrder: next });
            return getStmt.get(lastInsertRowid);
        },

        update(id, service) {
            const { changes } = updateStmt.run({ ...service, id });
            return changes ? getStmt.get(id) : undefined;
        },

        remove: (id) => deleteStmt.run(id).changes > 0,

        // `ids` must list every service exactly once, in the new order.
        reorder: db.transaction((ids) => {
            const existing = listStmt.all().map((s) => s.id);
            const wanted = new Set(ids);
            if (wanted.size !== ids.length || ids.length !== existing.length || !existing.every((id) => wanted.has(id))) {
                return false;
            }
            ids.forEach((id, i) => orderStmt.run(i, id));
            return true;
        }),
    };
}
