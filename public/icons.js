// Icons offered in the picker. Any other name from the dashboard-icons set also works.
export const ICONS = [
    'proxmox', 'pulse', 'sonarr', 'radarr', 'lidarr', 'prowlarr', 'qbittorrent', 'transmission', 'deluge',
    'plex', 'jellyfin', 'jellyseerr', 'emby', 'kodi', 'nginx-proxy-manager', 'traefik', 'caddy', 'nginx',
    'portainer', 'docker', 'home-assistant', 'openmediavault', 'n8n', 'pihole', 'adguard-home', 'unraid',
    'truenas', 'synology', 'grafana', 'prometheus', 'uptime-kuma', 'nextcloud', 'vaultwarden', 'gitea',
    'gitlab', 'github', 'wireguard', 'tailscale', 'frigate', 'homebridge', 'esphome', 'zigbee2mqtt',
    'node-red', 'mosquitto', 'paperless-ngx', 'immich', 'photoprism', 'audiobookshelf', 'calibre-web',
    'komga', 'overseerr', 'tautulli', 'bazarr', 'readarr', 'sabnzbd', 'nzbget', 'watchtower', 'dozzle',
    'homepage', 'homarr', 'dashy', 'organizr', 'guacamole', 'bookstack', 'wiki-js', 'mealie', 'tandoor',
    'actual-budget', 'firefly-iii', 'monica', 'authelia', 'crowdsec', 'fail2ban', 'minecraft', 'valheim',
    'satisfactory', 'ark', 'terraria', 'pterodactyl', 'cloudflare', 'apache', 'mysql', 'postgresql',
    'redis', 'mongodb', 'elasticsearch', 'rabbitmq', 'minio', 'netdata', 'zabbix', 'semaphore', 'ansible',
    'terraform', 'vault', 'consul', 'longhorn', 'rancher', 'argocd', 'lens', 'opnsense', 'pfsense',
    'speedtest-tracker', 'changedetection-io', 'ntfy', 'gotify', 'signal', 'matrix', 'lldap', 'keycloak',
];

export const iconUrl = (name) => `https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/${name}.svg`;
