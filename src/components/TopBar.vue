<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const emit = defineEmits(['logout', 'toggle-menu'])
const route = useRoute()
const authStore = useAuthStore()

const pageTitle = computed(() => route.meta?.title || route.name || 'Panel')
const initials = computed(() => {
  const name = authStore.user?.name || 'D'
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
})
</script>

<template>
  <header class="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-[60px] sm:h-[68px] bg-white/80 supports-[backdrop-filter]:bg-white/70 backdrop-blur border-b border-slate-100 sticky top-0 z-10 gap-3 sm:gap-4 flex-shrink-0">

    <!-- Mobile menu button + Title -->
    <div class="flex items-center gap-3 min-w-0">
      <button
        type="button"
        class="lg:hidden p-2 -ml-2 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 transition-colors"
        @click="emit('toggle-menu')"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>
      <div class="min-w-0">
        <h1 class="text-[15px] sm:text-[17px] font-bold text-slate-900 leading-tight truncate">{{ pageTitle }}</h1>
        <span class="hidden sm:inline text-xs text-slate-400">Pieces Control · Cotecmar</span>
      </div>
    </div>

    <div class="flex items-center gap-3 flex-shrink-0">
      <!-- User chip -->
      <div class="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
        <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {{ initials }}
        </div>
        <div class="leading-tight hidden sm:block">
          <p class="text-[13px] font-semibold text-slate-800">{{ authStore.user?.name || 'Demo User' }}</p>
          <p class="text-[11px] text-slate-400">{{ authStore.user?.email || 'demo@example.com' }}</p>
        </div>
      </div>

      <!-- Logout -->
      <button
        type="button"
        class="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 text-slate-500 text-sm font-medium hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-all duration-150"
        @click="emit('logout')"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        <span class="hidden sm:inline">Salir</span>
      </button>
    </div>
  </header>
</template>
