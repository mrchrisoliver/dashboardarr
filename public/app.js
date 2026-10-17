import { ICONS, iconUrl } from './icons.js';

const $ = (selector) => document.querySelector(selector);

const state = {
    services: [],
    query: '',
    editing: false,
    editId: null,
    deleteId: null,
    pickerQuery: '',
    dragId: null,
};

// Opened by IP (or localhost), links use each service's IP; opened by domain, they use its domain.
const host = location.hostname;
const isLocal = host === 'localhost' || host.includes(':') || /^\d{1,3}(\.\d{1,3}){3}$/.test(host);

const els = {
    grid: $('#grid'),
    empty: $('#empty'),
    count: $('#count'),
    search: $('#search'),
    editToggle: $('#edit-toggle'),
    banner: $('#edit-banner'),
    formDialog: $('#form-dialog'),
    form: $('#service-form'),
    formTitle: $('#form-title'),
    formError: $('#form-error'),
    saveButton: $('#save-button'),
    iconInput: $('#f-icon'),
    iconPreview: $('#icon-preview'),
    iconPicker: $('#icon-picker'),
    previewLocal: $('#preview-local'),
    previewDomain: $('#preview-domain'),
    confirmDialog: $('#confirm-dialog'),
    confirmTitle: $('#confirm-title'),
    confirmDelete: $('#confirm-delete'),
    toast: $('#toast'),
};

// ---------- Helpers ----------

function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

function svgIcon(paths, size = 16) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    for (const d of paths) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        svg.append(path);
    }
    return svg;
}

const ICON_PATHS = {
    pencil: ['M12 20h9', 'M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z'],
    bin: ['M3 6h18', 'M8 6V4h8v2', 'M19 6l-1 14H6L5 6'],
    grip: ['M9 5h.01', 'M9 12h.01', 'M9 19h.01', 'M15 5h.01', 'M15 12h.01', 'M15 19h.01'],
    plus: ['M12 5v14', 'M5 12h14'],
};

function localAddress(s) {
    if (!s.ip) return '';
    return s.port ? `${s.ip}:${s.port}` : s.ip;
}

function addressFor(s) {
    const local = localAddress(s);
    const domain = s.domain || '';
    const useLocal = isLocal ? Boolean(local) : !domain;
    if (useLocal && local) return { text: local, href: `http://${local}` };
    if (domain) return { text: domain, href: `https://${domain}` };
    return { text: 'No address set', href: '' };
}

// Fills `tile` with the service icon, or its first letter if there is none or it fails to load.
function showIcon(tile, icon, label) {
    const initial = () => tile.replaceChildren(el('span', 'initial', (label || '?').trim().charAt(0).toUpperCase() || '?'));
    if (!icon) return initial();
    const img = new Image();
    img.alt = '';
    img.src = iconUrl(icon);
    img.addEventListener('error', initial);
    tile.replaceChildren(img);
}

async function api(path, options = {}) {
    const response = await fetch(path, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...options.headers },
    });
    if (response.status === 204) return null;
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
        const error = new Error(body.error || `Request failed (${response.status})`);
        error.status = response.status;
        error.errors = body.errors;
        throw error;
    }
    return body;
}

let toastTimer;
function toast(message) {
    els.toast.textContent = message;
    els.toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (els.toast.hidden = true), 4000);
}

// ---------- Rendering ----------

function visibleServices() {
    const q = state.query.trim().toLowerCase();
    return q ? state.services.filter((s) => s.name.toLowerCase().includes(q)) : state.services;
}

function card(service) {
    const node = el('div', 'card');
    node.dataset.id = service.id;
    node.draggable = state.editing;

    const { text, href } = addressFor(service);
    const link = el('a', 'card-link');
    if (href && !state.editing) {
        link.href = href;
        link.rel = 'noopener';
    } else {
        link.setAttribute('aria-disabled', 'true');
    }

    const tile = el('div', 'icon-tile');
    showIcon(tile, service.icon, service.name);

    const body = el('div');
    body.append(el('div', 'card-name', service.name), el('div', 'card-address', text));
    link.append(tile, body);
    node.append(link);

    if (state.editing) {
        const actions = el('div', 'card-actions');

        const handle = el('button', 'btn-icon handle');
        handle.type = 'button';
        handle.dataset.action = 'move';
        handle.setAttribute('aria-label', `Reorder ${service.name} (use the arrow keys)`);
        handle.append(svgIcon(ICON_PATHS.grip));

        const edit = el('button', 'btn-icon');
        edit.type = 'button';
        edit.dataset.action = 'edit';
        edit.setAttribute('aria-label', `Edit ${service.name}`);
        edit.append(svgIcon(ICON_PATHS.pencil));

        const remove = el('button', 'btn-icon danger');
        remove.type = 'button';
        remove.dataset.action = 'delete';
        remove.setAttribute('aria-label', `Delete ${service.name}`);
        remove.append(svgIcon(ICON_PATHS.bin));

        actions.append(handle, edit, remove);
        node.append(actions);
    }

    return node;
}

function addTile() {
    const button = el('button', 'add-tile');
    button.type = 'button';
    button.dataset.action = 'add';
    button.append(svgIcon(ICON_PATHS.plus, 22), el('span', '', 'Add service'));
    return button;
}

function render() {
    const shown = visibleServices();
    els.grid.classList.toggle('editing', state.editing);
    els.grid.replaceChildren(...shown.map(card), addTile());

    const total = state.services.length;
    els.count.textContent = `${total} ${total === 1 ? 'service' : 'services'}`;

    const q = state.query.trim();
    els.empty.hidden = !(q && shown.length === 0);
    els.empty.textContent = `No services match “${q}”.`;

    els.banner.hidden = !state.editing;
    els.editToggle.setAttribute('aria-pressed', String(state.editing));
    els.editToggle.querySelector('span').textContent = state.editing ? 'Done' : 'Edit';
}

function renderMode() {
    $('#mode-dot').classList.toggle('local', isLocal);
    const label = $('#mode-label');
    label.replaceChildren(
        document.createTextNode(isLocal ? 'On your network ' : 'Via domain '),
        el('span', 'base', location.host),
    );
}

// ---------- Reordering ----------

async function saveOrder(services) {
    const previous = state.services;
    state.services = services;
    render();
    try {
        state.services = await api('/api/services/order', {
            method: 'PUT',
            body: JSON.stringify({ ids: services.map((s) => s.id) }),
        });
    } catch (error) {
        state.services = previous;
        render();
        toast(`Couldn't save the new order: ${error.message}`);
    }
}

// Moves service `id` next to `targetId` in the full list (works while the list is filtered).
function move(id, targetId, after) {
    if (id === targetId) return null;
    const list = state.services.filter((s) => s.id !== id);
    const moving = state.services.find((s) => s.id === id);
    const index = list.findIndex((s) => s.id === targetId);
    if (!moving || index === -1) return null;
    list.splice(after ? index + 1 : index, 0, moving);
    return list;
}

function focusHandle(id) {
    els.grid.querySelector(`.card[data-id="${id}"] [data-action="move"]`)?.focus();
}

els.grid.addEventListener('keydown', (event) => {
    const handle = event.target.closest('[data-action="move"]');
    if (!handle) return;
    const step = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 }[event.key];
    if (!step) return;
    event.preventDefault();

    const id = Number(handle.closest('.card').dataset.id);
    const shown = visibleServices();
    const target = shown[shown.findIndex((s) => s.id === id) + step];
    if (!target) return;

    const list = move(id, target.id, step > 0);
    if (list) {
        saveOrder(list);
        focusHandle(id);
    }
});

els.grid.addEventListener('dragstart', (event) => {
    const node = event.target.closest('.card');
    if (!node || !state.editing) return;
    state.dragId = Number(node.dataset.id);
    node.classList.add('dragging');
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', node.dataset.id);
});

els.grid.addEventListener('dragover', (event) => {
    const node = event.target.closest('.card');
    if (!node || state.dragId === null) return;
    event.preventDefault();
    els.grid.querySelectorAll('.drop-target').forEach((n) => n !== node && n.classList.remove('drop-target'));
    node.classList.add('drop-target');
});

els.grid.addEventListener('drop', (event) => {
    const node = event.target.closest('.card');
    if (!node || state.dragId === null) return;
    event.preventDefault();
    const rect = node.getBoundingClientRect();
    const after = event.clientX > rect.left + rect.width / 2;
    const list = move(state.dragId, Number(node.dataset.id), after);
    if (list) saveOrder(list);
});

els.grid.addEventListener('dragend', () => {
    state.dragId = null;
    els.grid.querySelectorAll('.dragging, .drop-target').forEach((n) => n.classList.remove('dragging', 'drop-target'));
});

// ---------- Add / edit form ----------

function setFieldErrors(errors = {}) {
    for (const node of els.form.querySelectorAll('[data-error-for]')) {
        const field = node.dataset.errorFor;
        node.textContent = errors[field] || '';
        els.form.elements[field].setAttribute('aria-invalid', errors[field] ? 'true' : 'false');
    }
}

function renderPicker() {
    const q = state.pickerQuery.trim().toLowerCase();
    const selected = els.iconInput.value.trim().toLowerCase();
    const matches = q ? ICONS.filter((name) => name.includes(q)) : ICONS;

    els.iconPicker.replaceChildren(
        ...matches.map((name) => {
            const option = el('button', 'icon-option');
            option.type = 'button';
            option.dataset.icon = name;
            option.title = name;
            option.setAttribute('role', 'option');
            option.setAttribute('aria-label', name);
            option.setAttribute('aria-selected', String(name === selected));
            const img = new Image();
            img.alt = '';
            img.loading = 'lazy';
            img.src = iconUrl(name);
            option.append(img);
            return option;
        }),
    );
}

function updatePreview() {
    const data = Object.fromEntries(new FormData(els.form));
    showIcon(els.iconPreview, data.icon.trim().toLowerCase(), data.name);

    const local = localAddress({ ip: data.ip.trim(), port: data.port.trim() });
    const domain = data.domain.trim().replace(/^https?:\/\//i, '');
    els.previewLocal.textContent = local ? `http://${local}` : 'Add an IP address';
    els.previewDomain.textContent = domain ? `https://${domain}` : 'Add a domain';

    els.saveButton.disabled = !data.name.trim();
}

function openForm(service) {
    state.editId = service ? service.id : null;
    state.pickerQuery = '';
    els.form.reset();

    if (service) {
        els.form.elements.name.value = service.name;
        els.form.elements.icon.value = service.icon;
        els.form.elements.ip.value = service.ip;
        els.form.elements.port.value = service.port ?? '';
        els.form.elements.domain.value = service.domain;
    }

    els.formTitle.textContent = service ? 'Edit service' : 'Add service';
    els.saveButton.textContent = service ? 'Save changes' : 'Add service';
    els.formError.hidden = true;
    setFieldErrors();
    renderPicker();
    updatePreview();
    els.formDialog.showModal();
    els.form.elements.name.focus();
}

els.form.addEventListener('input', (event) => {
    if (event.target === els.iconInput) {
        state.pickerQuery = els.iconInput.value;
        renderPicker();
    }
    updatePreview();
});

els.iconPicker.addEventListener('click', (event) => {
    const option = event.target.closest('[data-icon]');
    if (!option) return;
    els.iconInput.value = option.dataset.icon;
    renderPicker();
    updatePreview();
});

els.form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(els.form));
    const editing = state.editId !== null;

    els.saveButton.disabled = true;
    els.formError.hidden = true;
    try {
        const saved = await api(editing ? `/api/services/${state.editId}` : '/api/services', {
            method: editing ? 'PUT' : 'POST',
            body: JSON.stringify(data),
        });
        state.services = editing
            ? state.services.map((s) => (s.id === saved.id ? saved : s))
            : [...state.services, saved];
        els.formDialog.close();
        render();
        toast(editing ? `Saved ${saved.name}.` : `Added ${saved.name}.`);
    } catch (error) {
        if (error.errors) {
            setFieldErrors(error.errors);
        } else {
            els.formError.textContent = error.message;
            els.formError.hidden = false;
        }
    } finally {
        els.saveButton.disabled = !els.form.elements.name.value.trim();
    }
});

els.formDialog.addEventListener('close', () => {
    state.editId = null;
});

// ---------- Delete ----------

function openConfirm(service) {
    state.deleteId = service.id;
    els.confirmTitle.textContent = `Delete ${service.name}?`;
    els.confirmDialog.showModal();
}

els.confirmDelete.addEventListener('click', async () => {
    const service = state.services.find((s) => s.id === state.deleteId);
    if (!service) return els.confirmDialog.close();

    els.confirmDelete.disabled = true;
    try {
        await api(`/api/services/${service.id}`, { method: 'DELETE' });
        toast(`Deleted ${service.name}.`);
    } catch (error) {
        if (error.status !== 404) {
            toast(`Couldn't delete ${service.name}: ${error.message}`);
            return;
        }
    } finally {
        els.confirmDelete.disabled = false;
    }
    state.services = state.services.filter((s) => s.id !== service.id);
    els.confirmDialog.close();
    render();
});

els.confirmDialog.addEventListener('close', () => {
    state.deleteId = null;
});

// ---------- Global controls ----------

document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const service = state.services.find((s) => s.id === Number(button.closest('.card')?.dataset.id));

    switch (button.dataset.action) {
        case 'add':
            openForm();
            break;
        case 'edit':
            if (service) openForm(service);
            break;
        case 'delete':
            if (service) openConfirm(service);
            break;
        case 'close-form':
            els.formDialog.close();
            break;
        case 'cancel-delete':
            els.confirmDialog.close();
            break;
    }
});

els.search.addEventListener('input', () => {
    state.query = els.search.value;
    render();
});

els.editToggle.addEventListener('click', () => {
    state.editing = !state.editing;
    render();
});

// ---------- Start ----------

renderMode();

try {
    state.services = await api('/api/services');
    render();
} catch (error) {
    els.count.textContent = "Couldn't load services";
    toast(`Couldn't load services: ${error.message}`);
}
