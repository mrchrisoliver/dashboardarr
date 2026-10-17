import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, beforeEach, describe, test } from 'node:test';
import { createApp } from '../src/app.js';
import { createStore, openDb } from '../src/db.js';

let db;
let server;
let base;

async function request(method, path, body) {
    const response = await fetch(base + path, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
    });
    const text = await response.text();
    return { status: response.status, body: text ? JSON.parse(text) : null };
}

const sonarr = { name: 'Sonarr', icon: 'sonarr', ip: '10.0.1.201', port: '8989', domain: 'https://sonarr.example.com/' };

before(async () => {
    db = openDb(':memory:', { seed: false });
    server = createApp(createStore(db)).listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    base = `http://127.0.0.1:${server.address().port}`;
});

after(() => {
    server.close();
    db.close();
});

beforeEach(() => {
    db.exec('DELETE FROM services');
});

describe('services API', () => {
    test('creates a service and normalises its fields', async () => {
        const { status, body } = await request('POST', '/api/services', sonarr);
        assert.equal(status, 201);
        assert.deepEqual(
            { name: body.name, icon: body.icon, ip: body.ip, port: body.port, domain: body.domain },
            { name: 'Sonarr', icon: 'sonarr', ip: '10.0.1.201', port: 8989, domain: 'sonarr.example.com' },
        );

        const list = await request('GET', '/api/services');
        assert.equal(list.body.length, 1);
    });

    test('rejects invalid input with per-field errors', async () => {
        const { status, body } = await request('POST', '/api/services', { name: '', icon: 'Bad Icon!', port: '70000' });
        assert.equal(status, 422);
        assert.ok(body.errors.name);
        assert.ok(body.errors.icon);
        assert.ok(body.errors.port);
        assert.ok(body.errors.ip, 'needs an IP or a domain');
    });

    test('rejects an IP that includes a scheme', async () => {
        const { status, body } = await request('POST', '/api/services', { name: 'X', ip: 'http://10.0.1.5' });
        assert.equal(status, 422);
        assert.ok(body.errors.ip);
    });

    test('updates a service', async () => {
        const created = (await request('POST', '/api/services', sonarr)).body;
        const { status, body } = await request('PUT', `/api/services/${created.id}`, { ...sonarr, name: 'Sonarr 4K', port: '' });
        assert.equal(status, 200);
        assert.equal(body.name, 'Sonarr 4K');
        assert.equal(body.port, null);
    });

    test('returns 404 for a missing service', async () => {
        assert.equal((await request('PUT', '/api/services/999', sonarr)).status, 404);
        assert.equal((await request('DELETE', '/api/services/999')).status, 404);
        assert.equal((await request('DELETE', '/api/services/abc')).status, 404);
    });

    test('deletes a service', async () => {
        const created = (await request('POST', '/api/services', sonarr)).body;
        assert.equal((await request('DELETE', `/api/services/${created.id}`)).status, 204);
        assert.equal((await request('GET', '/api/services')).body.length, 0);
    });

    test('appends new services and reorders them', async () => {
        const a = (await request('POST', '/api/services', { ...sonarr, name: 'A' })).body;
        const b = (await request('POST', '/api/services', { ...sonarr, name: 'B' })).body;
        const c = (await request('POST', '/api/services', { ...sonarr, name: 'C' })).body;

        const { status, body } = await request('PUT', '/api/services/order', { ids: [c.id, a.id, b.id] });
        assert.equal(status, 200);
        assert.deepEqual(body.map((s) => s.name), ['C', 'A', 'B']);
        assert.deepEqual((await request('GET', '/api/services')).body.map((s) => s.name), ['C', 'A', 'B']);
    });

    test('rejects an order that misses or repeats a service', async () => {
        const a = (await request('POST', '/api/services', { ...sonarr, name: 'A' })).body;
        const b = (await request('POST', '/api/services', { ...sonarr, name: 'B' })).body;

        assert.equal((await request('PUT', '/api/services/order', { ids: [a.id] })).status, 409);
        assert.equal((await request('PUT', '/api/services/order', { ids: [a.id, a.id] })).status, 409);
        assert.equal((await request('PUT', '/api/services/order', { ids: [a.id, 'x'] })).status, 400);
        assert.deepEqual((await request('GET', '/api/services')).body.map((s) => s.id), [a.id, b.id]);
    });

    test('returns 400 for malformed JSON', async () => {
        assert.equal((await request('POST', '/api/services', '{not json')).status, 400);
    });

    test('serves the dashboard page', async () => {
        const response = await fetch(base + '/');
        assert.equal(response.status, 200);
        assert.match(await response.text(), /<title>Dashboardarr<\/title>/);
    });
});

describe('database', () => {
    test('seeds on first run only', () => {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dashboardarr-'));
        const file = path.join(dir, 'test.db');
        try {
            let fresh = openDb(file);
            let store = createStore(fresh);
            assert.equal(store.list().length, 11);
            store.list().forEach((s) => store.remove(s.id));
            fresh.close();

            fresh = openDb(file);
            store = createStore(fresh);
            assert.equal(store.list().length, 0, 'deleting everything must not re-seed');
            fresh.close();
        } finally {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    });
});
