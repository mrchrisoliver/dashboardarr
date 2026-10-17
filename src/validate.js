const ICON = /^[a-z0-9][a-z0-9-]*$/;
const HOST = /^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$/i;
const DOMAIN = /^[a-z0-9]([a-z0-9.-]*[a-z0-9])?(:\d{1,5})?(\/\S*)?$/i;

const text = (value) => (typeof value === 'string' ? value.trim() : '');

// Validates a service from a request body.
// Returns `{ service }` when valid, or `{ errors }` keyed by field.
export function parseService(body) {
    const input = body && typeof body === 'object' ? body : {};
    const errors = {};

    const name = text(input.name);
    if (!name) errors.name = 'Name is required.';
    else if (name.length > 100) errors.name = 'Keep the name under 100 characters.';

    const icon = text(input.icon).toLowerCase();
    if (icon && (icon.length > 100 || !ICON.test(icon))) {
        errors.icon = 'Use an icon name like "sonarr".';
    }

    const ip = text(input.ip);
    if (ip && (ip.length > 255 || !HOST.test(ip))) {
        errors.ip = 'Enter an IP address or hostname, without http:// or a port.';
    }

    let port = null;
    const rawPort = input.port === null || input.port === undefined ? '' : String(input.port).trim();
    if (rawPort) {
        port = Number(rawPort);
        if (!Number.isInteger(port) || port < 1 || port > 65535) {
            errors.port = 'Enter a port from 1 to 65535.';
        }
    }

    const domain = text(input.domain).replace(/^https?:\/\//i, '').replace(/\/+$/, '');
    if (domain && (domain.length > 255 || !DOMAIN.test(domain))) {
        errors.domain = 'Enter a domain like sonarr.example.com.';
    }

    if (!ip && !domain && !errors.ip && !errors.domain) {
        errors.ip = 'Add an IP address, a domain, or both.';
    }

    return Object.keys(errors).length ? { errors } : { service: { name, icon, ip, port, domain } };
}

export function parseId(value) {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
}
