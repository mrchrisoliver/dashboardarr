import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { parseId, parseService } from './validate.js';

const publicDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');

export function createApp(store) {
    const app = express();
    app.disable('x-powered-by');
    app.use(express.json({ limit: '16kb' }));

    app.get('/api/health', (req, res) => {
        res.json({ status: 'ok' });
    });

    app.get('/api/services', (req, res) => {
        res.json(store.list());
    });

    app.post('/api/services', (req, res) => {
        const { service, errors } = parseService(req.body);
        if (errors) return res.status(422).json({ errors });
        res.status(201).json(store.create(service));
    });

    // Registered before `/:id` so "order" is not read as an id.
    app.put('/api/services/order', (req, res) => {
        const ids = req.body?.ids;
        if (!Array.isArray(ids) || !ids.every((id) => parseId(id) === id)) {
            return res.status(400).json({ error: 'Send { "ids": [...] } with every service id in the new order.' });
        }
        if (!store.reorder(ids)) {
            return res.status(409).json({ error: 'The list of ids must include every service exactly once.' });
        }
        res.json(store.list());
    });

    app.put('/api/services/:id', (req, res) => {
        const id = parseId(req.params.id);
        if (!id) return res.status(404).json({ error: 'Service not found.' });

        const { service, errors } = parseService(req.body);
        if (errors) return res.status(422).json({ errors });

        const updated = store.update(id, service);
        if (!updated) return res.status(404).json({ error: 'Service not found.' });
        res.json(updated);
    });

    app.delete('/api/services/:id', (req, res) => {
        const id = parseId(req.params.id);
        if (!id || !store.remove(id)) return res.status(404).json({ error: 'Service not found.' });
        res.status(204).end();
    });

    app.use('/api', (req, res) => {
        res.status(404).json({ error: 'Not found.' });
    });

    app.use(express.static(publicDir));

    app.use((err, req, res, next) => {
        if (err.type === 'entity.parse.failed') {
            return res.status(400).json({ error: 'Request body must be valid JSON.' });
        }
        if (err.type === 'entity.too.large') {
            return res.status(413).json({ error: 'Request body is too large.' });
        }
        console.error(err);
        res.status(500).json({ error: 'Something went wrong.' });
    });

    return app;
}
