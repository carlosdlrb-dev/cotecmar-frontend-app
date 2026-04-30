<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isActive = (...names) => computed(() => names.includes(route.name))
</script>

<template>
  <aside class="w-64 h-screen flex-shrink-0 flex flex-col overflow-y-auto bg-gradient-to-b from-slate-900 via-[#0d2530] to-[#071f2a] border-r border-white/5">
    <!-- Ambient glow effect -->
    <div class="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-brand-500/5 to-transparent pointer-events-none"></div>

    <!-- Brand -->
    <div class="flex items-center gap-3 px-5 pt-7 pb-5 relative z-10">
      <div class="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 flex-shrink-0 shadow-glow-sm animate-pulse-glow">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
          <line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
      </div>
      <div>
        <p class="text-white font-bold text-sm leading-tight">Control de Piezas</p>
        <p class="text-white/35 text-xs mt-0.5">Cotecmar</p>
      </div>
    </div>

    <div class="mx-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4"></div>

    <!-- Nav -->
    <nav class="flex-1 px-3 space-y-1 relative z-10">
      <RouterLink
        to="/dashboard"
        class="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 border-l-2 relative overflow-hidden"
        :class="isActive('dashboard').value
          ? 'bg-gradient-to-r from-brand-500/20 to-brand-500/5 text-brand-300 border-brand-400 shadow-glow-sm'
          : 'text-white/50 hover:text-white/90 hover:bg-white/5 border-transparent'"
      >
        <div v-if="isActive('dashboard').value" class="absolute inset-0 bg-gradient-to-r from-brand-400/10 to-transparent opacity-50"></div>
        <svg class="w-5 h-5 flex-shrink-0 transition-all duration-300" :class="isActive('dashboard').value ? 'text-brand-400 scale-110' : 'text-white/40 group-hover:text-brand-300 group-hover:scale-110'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1.5"/>
          <rect x="14" y="3" width="7" height="7" rx="1.5"/>
          <rect x="3" y="14" width="7" height="7" rx="1.5"/>
          <rect x="14" y="14" width="7" height="7" rx="1.5"/>
        </svg>
        <span class="relative z-10">Dashboard</span>
      </RouterLink>

      <RouterLink
        to="/proyectos"
        class="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 border-l-2 relative overflow-hidden"
        :class="isActive('projects', 'project-blocks').value
          ? 'bg-gradient-to-r from-brand-500/20 to-brand-500/5 text-brand-300 border-brand-400 shadow-glow-sm'
          : 'text-white/50 hover:text-white/90 hover:bg-white/5 border-transparent'"
      >
        <div v-if="isActive('projects', 'project-blocks').value" class="absolute inset-0 bg-gradient-to-r from-brand-400/10 to-transparent opacity-50"></div>
        <svg class="w-5 h-5 flex-shrink-0 transition-all duration-300" :class="isActive('projects', 'project-blocks').value ? 'text-brand-400 scale-110' : 'text-white/40 group-hover:text-brand-300 group-hover:scale-110'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
        </svg>
        <span class="relative z-10">Proyectos</span>
      </RouterLink>

      <RouterLink
        to="/bloques"
        class="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 border-l-2 relative overflow-hidden"
        :class="isActive('blocks', 'project-blocks').value
          ? 'bg-gradient-to-r from-brand-500/20 to-brand-500/5 text-brand-300 border-brand-400 shadow-glow-sm'
          : 'text-white/50 hover:text-white/90 hover:bg-white/5 border-transparent'"
      >
        <div v-if="isActive('blocks', 'project-blocks').value" class="absolute inset-0 bg-gradient-to-r from-brand-400/10 to-transparent opacity-50"></div>
        <svg class="w-5 h-5 flex-shrink-0 transition-all duration-300" :class="isActive('blocks', 'project-blocks').value ? 'text-brand-400 scale-110' : 'text-white/40 group-hover:text-brand-300 group-hover:scale-110'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 8V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2"/>
          <path d="M3 8v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8"/>
          <line x1="3" y1="8" x2="21" y2="8"/>
          <rect x="4" y="10" width="16" height="6" rx="1"/>
          <path d="M9 18v2a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-2"/>
        </svg>
        <span class="relative z-10">Bloques</span>
      </RouterLink>

      <RouterLink
        to="/piezas"
        class="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 border-l-2 relative overflow-hidden"
        :class="isActive('pieces').value
          ? 'bg-gradient-to-r from-brand-500/20 to-brand-500/5 text-brand-300 border-brand-400 shadow-glow-sm'
          : 'text-white/50 hover:text-white/90 hover:bg-white/5 border-transparent'"
      >
        <div v-if="isActive('pieces').value" class="absolute inset-0 bg-gradient-to-r from-brand-400/10 to-transparent opacity-50"></div>
        <svg class="w-5 h-5 flex-shrink-0 transition-all duration-300" :class="isActive('pieces').value ? 'text-brand-400 scale-110' : 'text-white/40 group-hover:text-brand-300 group-hover:scale-110'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/>
          <line x1="12" y1="22" x2="12" y2="15.5"/>
          <polyline points="22 8.5 12 15.5 2 8.5"/>
        </svg>
        <span class="relative z-10">Piezas</span>
      </RouterLink>

      <RouterLink
        to="/reportes"
        class="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 border-l-2 relative overflow-hidden"
        :class="isActive('reports').value
          ? 'bg-gradient-to-r from-brand-500/20 to-brand-500/5 text-brand-300 border-brand-400 shadow-glow-sm'
          : 'text-white/50 hover:text-white/90 hover:bg-white/5 border-transparent'"
      >
        <div v-if="isActive('reports').value" class="absolute inset-0 bg-gradient-to-r from-brand-400/10 to-transparent opacity-50"></div>
        <svg class="w-5 h-5 flex-shrink-0 transition-all duration-300" :class="isActive('reports').value ? 'text-brand-400 scale-110' : 'text-white/40 group-hover:text-brand-300 group-hover:scale-110'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"/>
          <line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="14"/>
          <line x1="2" y1="20" x2="22" y2="20"/>
        </svg>
        <span class="relative z-10">Reportes</span>
      </RouterLink>
    </nav>

    <!-- Footer services -->
    <div class="px-5 py-5 border-t border-white/5 space-y-2.5 relative z-10">
      <div class="flex items-center gap-2.5 group cursor-default">
        <span class="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
        <span class="text-white/30 text-xs group-hover:text-white/50 transition-colors">Auth Service</span>
        <span class="ml-auto text-[10px] text-emerald-400/60 font-mono">ONLINE</span>
      </div>
      <div class="flex items-center gap-2.5 group cursor-default">
        <span class="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
        <span class="text-white/30 text-xs group-hover:text-white/50 transition-colors">Pieces API</span>
        <span class="ml-auto text-[10px] text-emerald-400/60 font-mono">ONLINE</span>
      </div>
    </div>
  </aside>
</template>
