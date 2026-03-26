<script setup>
import { ref, computed } from 'vue';

const model = defineModel({ type: String, default: '' });

const search = ref('');

const icons = [
    'proxmox', 'sonarr', 'radarr', 'lidarr', 'prowlarr', 'qbittorrent', 'transmission', 'deluge',
    'plex', 'jellyfin', 'emby', 'kodi', 'nginx-proxy-manager', 'traefik', 'caddy', 'nginx',
    'portainer', 'docker', 'home-assistant', 'pihole', 'adguard-home', 'unraid', 'truenas',
    'synology', 'grafana', 'prometheus', 'uptime-kuma', 'nextcloud', 'vaultwarden', 'gitea',
    'gitlab', 'github', 'wireguard', 'tailscale', 'frigate', 'homebridge', 'esphome',
    'zigbee2mqtt', 'node-red', 'mosquitto', 'paperless-ngx', 'immich', 'photoprism',
    'audiobookshelf', 'calibre-web', 'komga', 'overseerr', 'tautulli', 'bazarr', 'readarr',
    'sabnzbd', 'nzbget', 'watchtower', 'dozzle', 'homepage', 'homarr', 'dashy', 'organizr',
    'guacamole', 'bookstack', 'wiki-js', 'mealie', 'tandoor', 'actual-budget', 'firefly-iii',
    'monica', 'authelia', 'crowdsec', 'fail2ban', 'minecraft', 'valheim', 'satisfactory',
    'ark', 'terraria', 'pterodactyl', 'cloudflare', 'apache', 'mysql', 'postgresql', 'redis',
    'mongodb', 'elasticsearch', 'rabbitmq', 'minio', 'netdata', 'zabbix', 'semaphore',
    'ansible', 'terraform', 'vault', 'consul', 'longhorn', 'rancher', 'argocd', 'lens',
    'opnsense', 'pfsense', 'speedtest-tracker', 'changedetection-io', 'ntfy', 'gotify',
    'signal', 'matrix', 'lldap', 'keycloak',
];

const iconUrl = (slug) => `https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/${slug}.svg`;

const filtered = computed(() => {
    if (!search.value) return icons;
    const q = search.value.toLowerCase();
    return icons.filter(i => i.includes(q));
});
</script>

<template>
    <div>
        <input
            v-model="search"
            type="text"
            placeholder="Search icons..."
            class="mb-3 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <div class="grid max-h-48 grid-cols-6 gap-2 overflow-y-auto sm:grid-cols-8">
            <button
                v-for="icon in filtered"
                :key="icon"
                type="button"
                @click="model = icon"
                class="flex flex-col items-center gap-1 rounded-lg border p-2 transition"
                :class="model === icon
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600 hover:bg-slate-700/50'"
                :title="icon"
            >
                <img :src="iconUrl(icon)" :alt="icon" class="h-7 w-7" />
            </button>
        </div>
        <p v-if="filtered.length === 0" class="py-4 text-center text-sm text-slate-500">No icons found</p>
        <p v-if="model" class="mt-2 text-xs text-slate-400">
            Selected: <span class="font-medium text-slate-300">{{ model }}</span>
        </p>
    </div>
</template>
