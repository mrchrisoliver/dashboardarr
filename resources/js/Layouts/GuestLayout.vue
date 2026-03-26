<script setup>
import { Link } from '@inertiajs/vue3';
</script>

<template>
    <div class="flex min-h-screen flex-col items-center bg-slate-950 pt-6 sm:justify-center sm:pt-0">
        <div>
            <Link href="/" class="flex items-center gap-2">
                <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                </div>
                <span class="text-xl font-bold text-white">Dashboardarr</span>
            </Link>
        </div>

        <div class="mt-6 w-full overflow-hidden rounded-2xl border border-slate-800/50 bg-slate-900/80 px-6 py-6 shadow-xl backdrop-blur-sm sm:max-w-md">
            <slot />
        </div>
    </div>
</template>
