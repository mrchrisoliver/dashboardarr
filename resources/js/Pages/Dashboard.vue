<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import BookmarkCard from '@/Components/BookmarkCard.vue';
import BookmarkModal from '@/Components/BookmarkModal.vue';
import { Head } from '@inertiajs/vue3';
import { ref } from 'vue';

const props = defineProps({
    bookmarks: Array,
});

const showModal = ref(false);
const editingBookmark = ref(null);

const openCreate = () => {
    editingBookmark.value = null;
    showModal.value = true;
};

const openEdit = (bookmark) => {
    editingBookmark.value = bookmark;
    showModal.value = true;
};

const closeModal = () => {
    showModal.value = false;
    editingBookmark.value = null;
};
</script>

<template>
    <Head title="Dashboard" />

    <AuthenticatedLayout>
        <div class="px-4 py-8 sm:px-6 lg:px-8">
            <div class="mx-auto max-w-7xl">
                <!-- Header -->
                <div class="mb-8 flex items-center justify-between">
                    <div>
                        <h1 class="text-2xl font-bold text-white">Services</h1>
                        <p class="mt-1 text-sm text-slate-400">Your self-hosted applications</p>
                    </div>
                    <button
                        @click="openCreate"
                        class="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-950"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                        </svg>
                        Add Service
                    </button>
                </div>

                <!-- Empty state -->
                <div v-if="bookmarks.length === 0" class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700/50 bg-slate-900/30 px-6 py-20">
                    <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800/50">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                    </div>
                    <h3 class="mt-4 text-lg font-medium text-slate-300">No services yet</h3>
                    <p class="mt-1 text-sm text-slate-500">Add your first self-hosted service to get started.</p>
                    <button
                        @click="openCreate"
                        class="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                        </svg>
                        Add Service
                    </button>
                </div>

                <!-- Bookmark grid -->
                <div v-else class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    <BookmarkCard
                        v-for="bookmark in bookmarks"
                        :key="bookmark.id"
                        :bookmark="bookmark"
                        @edit="openEdit(bookmark)"
                    />
                </div>
            </div>
        </div>

        <BookmarkModal
            :show="showModal"
            :bookmark="editingBookmark"
            @close="closeModal"
        />
    </AuthenticatedLayout>
</template>
