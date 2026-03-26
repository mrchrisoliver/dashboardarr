<script setup>
import Modal from '@/Components/Modal.vue';
import IconPicker from '@/Components/IconPicker.vue';
import InputError from '@/Components/InputError.vue';
import { useForm } from '@inertiajs/vue3';
import { watch } from 'vue';

const props = defineProps({
    show: Boolean,
    bookmark: Object,
});

const emit = defineEmits(['close']);

const form = useForm({
    name: '',
    external_url: '',
    internal_url: '',
    icon: '',
    sort_order: 0,
});

watch(() => props.show, (val) => {
    if (val && props.bookmark) {
        form.name = props.bookmark.name;
        form.external_url = props.bookmark.external_url;
        form.internal_url = props.bookmark.internal_url || '';
        form.icon = props.bookmark.icon || '';
        form.sort_order = props.bookmark.sort_order || 0;
    } else if (val) {
        form.reset();
        form.clearErrors();
    }
});

const submit = () => {
    if (props.bookmark) {
        form.put(route('bookmarks.update', props.bookmark.id), {
            preserveScroll: true,
            onSuccess: () => emit('close'),
        });
    } else {
        form.post(route('bookmarks.store'), {
            preserveScroll: true,
            onSuccess: () => emit('close'),
        });
    }
};
</script>

<template>
    <Modal :show="show" max-width="lg" @close="emit('close')">
        <div class="bg-slate-900 p-6">
            <h2 class="text-lg font-semibold text-white">
                {{ bookmark ? 'Edit Service' : 'Add Service' }}
            </h2>
            <form @submit.prevent="submit" class="mt-5 space-y-4">
                <!-- Name -->
                <div>
                    <label class="mb-1 block text-sm font-medium text-slate-300">Name</label>
                    <input
                        v-model="form.name"
                        type="text"
                        placeholder="e.g. Proxmox"
                        class="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        autofocus
                    />
                    <InputError :message="form.errors.name" class="mt-1" />
                </div>

                <!-- External URL -->
                <div>
                    <label class="mb-1 block text-sm font-medium text-slate-300">External URL</label>
                    <input
                        v-model="form.external_url"
                        type="url"
                        placeholder="https://proxmox.example.com"
                        class="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <InputError :message="form.errors.external_url" class="mt-1" />
                </div>

                <!-- Internal URL -->
                <div>
                    <label class="mb-1 block text-sm font-medium text-slate-300">Internal URL</label>
                    <input
                        v-model="form.internal_url"
                        type="text"
                        placeholder="e.g. 192.168.1.100:8006"
                        class="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <InputError :message="form.errors.internal_url" class="mt-1" />
                </div>

                <!-- Icon Picker -->
                <div>
                    <label class="mb-1 block text-sm font-medium text-slate-300">Icon</label>
                    <IconPicker v-model="form.icon" />
                    <InputError :message="form.errors.icon" class="mt-1" />
                </div>

                <!-- Sort Order -->
                <div>
                    <label class="mb-1 block text-sm font-medium text-slate-300">Sort Order</label>
                    <input
                        v-model.number="form.sort_order"
                        type="number"
                        class="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                </div>

                <!-- Actions -->
                <div class="flex items-center justify-end gap-3 pt-2">
                    <button
                        type="button"
                        @click="emit('close')"
                        class="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        :disabled="form.processing"
                        class="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:opacity-50"
                    >
                        {{ bookmark ? 'Save Changes' : 'Add Service' }}
                    </button>
                </div>
            </form>
        </div>
    </Modal>
</template>
