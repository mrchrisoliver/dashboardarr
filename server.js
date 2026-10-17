import { createApp } from './src/app.js';
import { createStore, openDb } from './src/db.js';

const port = Number(process.env.PORT) || 3000;
const dbPath = process.env.DB_PATH || './data/dashboardarr.db';

const db = openDb(dbPath, { seed: process.env.SEED !== 'false' });
const app = createApp(createStore(db));

const server = app.listen(port, () => {
    console.log(`Dashboardarr listening on http://localhost:${port} (database: ${dbPath})`);
});

function shutdown() {
    server.close(() => {
        db.close();
        process.exit(0);
    });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
