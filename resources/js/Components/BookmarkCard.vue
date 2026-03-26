<script setup>
import { router } from '@inertiajs/vue3';
import { ref, computed } from 'vue';

const props = defineProps({
    bookmark: Object,
});

const emit = defineEmits(['edit']);

const iconError = ref(false);
const showActions = ref(false);

const iconUrl = (slug) => {
    if (!slug) return null;
    return `https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/${slug}.svg`;
};

// Determine if the user is accessing the dashboard via an IP address
const isAccessingViaIp = computed(() => {
    const hostname = window.location.hostname;
    // Match IPv4 or IPv6 or localhost
    return /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname === 'localhost' || hostname.startsWith('[');
});

// Use internal_url when accessing via IP, external_url when accessing via domain
const bookmarkHref = computed(() => {
    if (isAccessingViaIp.value && props.bookmark.internal_url) {
        // Ensure the internal_url has a protocol
        const url = props.bookmark.internal_url;
        return url.match(/^https?:\/\//) ? url : `http://${url}`;
    }
    return props.bookmark.external_url;
});

const deleteBookmark = () => {
    if (confirm('Remove this service?')) {
        router.delete(route('bookmarks.destroy', props.bookmark.id), {
            preserveScroll: true,
        });
    }
};

const initials = (name) => {
    return name.split(/[\s-]+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
};
</script>

<template>
    <a
        :href="bookmarkHref"
        target="_blank"
        rel="noopener noreferrer"
        class="group relative flex flex-col items-center rounded-2xl border border-slate-800/50 bg-slate-900/50 p-5 backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] hover:border-slate-700/50 hover:bg-slate-800/50 hover:shadow-lg hover:shadow-slate-950/50"
        @mouseenter="showActions = true"
        @mouseleave="showActions = false"
    >
        <!-- Action buttons -->
        <Transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="opacity-0 scale-90"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-90"
        >
            <div v-show="showActions" class="absolute right-2 top-2 flex gap-1">
                <button
                    @click.prevent.stop="emit('edit')"
                    class="rounded-lg bg-slate-700/80 p-1.5 text-slate-300 transition hover:bg-slate-600 hover:text-white"
                    title="Edit"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                </button>
                <button
                    @click.prevent.stop="deleteBookmark"
                    class="rounded-lg bg-slate-700/80 p-1.5 text-slate-300 transition hover:bg-red-500/80 hover:text-white"
                    title="Delete"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                </button>
            </div>
        </Transition>

        <!-- Icon -->
        <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-slate-800/80">
            <img
                v-if="bookmark.icon && !iconError"
                :src="iconUrl(bookmark.icon)"
                :alt="bookmark.name"
                class="h-9 w-9"
                @error="iconError = true"
            />
            <span v-else class="text-sm font-bold text-slate-400">{{ initials(bookmark.name) }}</span>
        </div>

        <!-- Name -->
        <span class="text-center text-sm font-medium text-slate-200 group-hover:text-white">{{ bookmark.name }}</span>

        <!-- Show the alternate URL (the one not being used as the main link) -->
        <span
            v-if="bookmark.internal_url"
            class="mt-2 max-w-full truncate rounded-md bg-slate-800/60 px-2 py-0.5 text-[10px] text-slate-500"
            :title="isAccessingViaIp ? bookmark.external_url : bookmark.internal_url"
        >
            {{ isAccessingViaIp ? bookmark.external_url : bookmark.internal_url }}
        </span>
    </a>
</template>
