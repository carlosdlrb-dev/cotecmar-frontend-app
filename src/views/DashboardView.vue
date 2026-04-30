<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { piecesApi } from '../api/client'

const router = useRouter()
const loading = ref(true)

const totalProjects = ref(0)
const totalBlocks = ref(0)
const pendingCount = ref(0)
const fabricatedCount = ref(0)
const stateTotals = ref([])
const pendingByProject = ref([])

const totalPieces = computed(() =>
  stateTotals.value.length
    ? stateTotals.value.reduce((sum, item) => sum + item.total, 0)
    : pendingCount.value + fabricatedCount.value
)
const fabricatedPct = computed(() =>
  totalPieces.value ? Math.round((fabricatedCount.value / totalPieces.value) * 100) : 0
)
const pendingPct = computed(() => (totalPieces.value ? 100 - fabricatedPct.value : 0))

const projectCountLabel = computed(() => {
  if (!totalProjects.value) return 'Sin proyectos detectados'
  return totalProjects.value === 1 ? '1 proyecto activo' : `${totalProjects.value} proyectos activos`
})

const projectCountHint = computed(() => {
  if (!totalProjects.value) return 'Agrega proyectos para ver el resumen en vivo.'
  return 'Conteo real de proyectos disponible en el servicio.'
})

const maxPending = computed(() =>
  Math.max(1, ...pendingByProject.value.map((p) => p.piezas_pendientes ?? p.total ?? 0))
)

const extractProjectsTotal = (payload) => {
  if (Array.isArray(payload)) return payload.length
  if (Array.isArray(payload?.data)) return payload.meta?.total ?? payload.data.length
  return payload?.meta?.total ?? payload?.total ?? 0
}

const extractStateTotals = (payload) => {
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.items)
        ? payload.items
        : []

  return list
    .map((item) => ({
      estado: String(item?.estado ?? item?.state ?? '').trim().toLowerCase(),
      total: Number(item?.total ?? item?.count ?? item?.cantidad ?? 0),
    }))
    .filter((item) => item.estado)
}

const fetchDashboard = async () => {
  loading.value = true
  try {
    const [projRes, statesRes, pendingRes] = await Promise.allSettled([
      piecesApi.get('/proyectos', { params: { page: 1, per_page: 1000 } }),
      piecesApi.get('/reportes/totales-por-estado'),
      piecesApi.get('/reportes/pendientes-por-proyecto'),
    ])
    if (projRes.status === 'fulfilled') {
      totalProjects.value = extractProjectsTotal(projRes.value.data)
    }
    if (statesRes.status === 'fulfilled') {
      stateTotals.value = extractStateTotals(statesRes.value.data)
      pendingCount.value = stateTotals.value.find((s) => s.estado === 'pendiente' || s.estado === 'pending')?.total ?? 0
      fabricatedCount.value = stateTotals.value.find((s) => s.estado === 'fabricada' || s.estado === 'fabricated')?.total ?? 0
    }
    if (pendingRes.status === 'fulfilled') {
      pendingByProject.value = (pendingRes.value.data ?? []).slice(0, 6)
    }
  } finally {
    loading.value = false
  }
}

onMounted(fetchDashboard)
</script>

<template>
  <section class="page space-y-4 sm:space-y-6">
    <div class="dashboard-hero animate-fade-up">
      <div class="dashboard-orb dashboard-orb--primary"></div>
      <div class="dashboard-orb dashboard-orb--secondary"></div>

      <div class="relative grid gap-5 lg:grid-cols-[1.35fr_0.95fr] items-center">
        <div class="space-y-5">
          <div class="flex flex-wrap items-center gap-2">
            <span class="pill bounce-badge">LIVE</span>
            <span class="text-[11px] sm:text-xs uppercase tracking-[0.22em] text-slate-500 font-bold">Panel operativo</span>
          </div>

          <div class="space-y-3">
            <h1 class="text-[28px] sm:text-[42px] font-black text-slate-900 leading-[1.05] tracking-tight max-w-3xl">
              Una vista más clara para controlar proyectos, piezas y fabricación.
            </h1>
            <p class="text-sm sm:text-base text-slate-500 max-w-2xl leading-relaxed">
              Sigue el avance en tiempo real, detecta pendientes al instante y navega el estado del taller con una interfaz más limpia y visual.
            </p>
          </div>

          <div class="flex flex-wrap gap-2.5">
            <span class="project-chip">{{ projectCountLabel }}</span>
            <span class="project-chip">Control en vivo</span>
            <span class="project-chip">Reportes instantáneos</span>
          </div>

          <div class="flex flex-wrap gap-3">
            <button class="primary-button magnetic-hover shimmer-btn group" @click="router.push('/proyectos')">
              <svg class="transition-transform group-hover:translate-x-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14m-7-7h14" />
              </svg>
              Ver proyectos
            </button>
            <RouterLink to="/piezas" class="ghost-button magnetic-hover group px-4 py-2.5">
              <span>Ir a piezas</span>
              <svg class="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </RouterLink>
          </div>
        </div>

        <div class="glass-card dashboard-summary-card relative overflow-hidden p-5 sm:p-6">
          <div class="absolute inset-0 bg-gradient-to-br from-white via-white/90 to-brand-50/50"></div>
          <div class="relative">
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="text-[11px] uppercase tracking-[0.24em] font-bold text-slate-400">Proyectos activos</p>
                <p class="text-xs text-slate-500 mt-1">{{ projectCountHint }}</p>
              </div>
              <span class="pill text-[10px] px-2.5 py-1">Actualizado</span>
            </div>

            <div class="mt-4 flex items-end gap-3">
              <span class="text-[56px] sm:text-[72px] leading-none font-black text-slate-900 counter-animate">{{ totalProjects }}</span>
              <div class="pb-2">
                <div class="text-sm font-bold text-slate-900">{{ projectCountLabel }}</div>
                <div class="text-xs text-slate-500">Datos consolidados desde el servicio de proyectos.</div>
              </div>
            </div>

            <div class="mt-5 grid grid-cols-2 gap-3">
              <div class="mini-metric">
                <span>Piezas fabricadas</span>
                <strong>{{ fabricatedCount }}</strong>
              </div>
              <div class="mini-metric">
                <span>Piezas pendientes</span>
                <strong>{{ pendingCount }}</strong>
              </div>
            </div>

            <div class="mt-5 space-y-3">
              <div class="space-y-1">
                <div class="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Fabricadas</span>
                  <span>{{ fabricatedPct }}%</span>
                </div>
                <div class="progress-track">
                  <div class="progress-fill progress-fill--success" :style="{ width: fabricatedPct + '%' }"></div>
                </div>
              </div>
              <div class="space-y-1">
                <div class="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Pendientes</span>
                  <span>{{ pendingPct }}%</span>
                </div>
                <div class="progress-track">
                  <div class="progress-fill progress-fill--warning" :style="{ width: pendingPct + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div v-if="loading" class="stats-grid">
      <div v-for="i in 4" :key="i" class="stat-card skeleton" style="height:130px;"></div>
    </div>

    <div v-else class="stats-grid">
      <article class="stat-card group animate-fade-up stagger-1 tilt-hover">
        <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <div class="w-2 h-2 rounded-full bg-brand-400 animate-pulse"></div>
        </div>
        <div class="stat-icon" data-color="primary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <p class="stat-label">Proyectos activos</p>
        <p class="stat-value counter-animate">{{ totalProjects }}</p>
        <p class="stat-trend">
          <RouterLink to="/proyectos" class="link flex items-center gap-1 group/link">
            Ver todos
            <svg class="w-3 h-3 transition-transform group-hover/link:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </RouterLink>
        </p>
      </article>

      <article class="stat-card group animate-fade-up stagger-2 tilt-hover">
        <div class="stat-icon" data-color="success">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
            <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/>
            <line x1="12" y1="22" x2="12" y2="15.5"/>
            <polyline points="22 8.5 12 15.5 2 8.5"/>
          </svg>
        </div>
        <p class="stat-label">Piezas fabricadas</p>
        <p class="stat-value counter-animate">{{ fabricatedCount }}</p>
        <p class="stat-trend flex items-center gap-1" data-dir="up">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
          </svg>
          {{ fabricatedPct }}% del total
        </p>
      </article>

      <article class="stat-card group animate-fade-up stagger-3 tilt-hover">
        <div class="stat-icon" data-color="warning">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <p class="stat-label">Piezas pendientes</p>
        <p class="stat-value counter-animate">{{ pendingCount }}</p>
        <p class="stat-trend flex items-center gap-1" data-dir="down">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          {{ pendingPct }}% por fabricar
        </p>
      </article>

      <article class="stat-card group animate-fade-up stagger-4 tilt-hover">
        <div class="stat-icon" data-color="danger">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <p class="stat-label">Total piezas</p>
        <p class="stat-value counter-animate">{{ totalPieces }}</p>
        <p class="stat-trend">
          <RouterLink to="/piezas" class="link flex items-center gap-1 group/link">
            Ver piezas
            <svg class="w-3 h-3 transition-transform group-hover/link:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </RouterLink>
        </p>
      </article>
    </div>

    <!-- Charts row -->
    <div class="grid-two">
      <!-- Production state chart -->
      <article class="panel hover-lift animate-fade-up stagger-3">
        <div class="panel-header flex-col sm:flex-row items-start sm:items-center gap-2">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-brand-100 flex items-center justify-center text-brand-600">
              <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
            <h2 class="text-sm sm:text-[15px]">Estado de producción</h2>
          </div>
          <span class="pill text-[10px]">Actual</span>
        </div>
        <div v-if="loading" class="skeleton" style="height:100px;border-radius:8px;"></div>
        <div v-else class="chart space-y-4">
          <div class="chart-bar group cursor-default" :style="{ '--value': fabricatedPct + '%' }">
            <div class="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              Fabricadas
            </span>
            <strong class="text-emerald-700">{{ fabricatedPct }}%</strong>
          </div>
          <div class="chart-bar group cursor-default" :style="{ '--value': pendingPct + '%' }">
            <div class="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-amber-500"></span>
              Pendientes
            </span>
            <strong class="text-amber-700">{{ pendingPct }}%</strong>
          </div>
        </div>
      </article>

      <!-- Pending by project chart -->
      <article class="panel hover-lift animate-fade-up stagger-4">
        <div class="panel-header flex-col sm:flex-row items-start sm:items-center gap-2">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
              <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h2 class="text-sm sm:text-[15px]">Pendientes por proyecto</h2>
          </div>
          <span class="pill text-[10px]">Top proyectos</span>
        </div>
        <div v-if="loading" class="skeleton" style="height:160px;border-radius:8px;"></div>
        <div v-else-if="pendingByProject.length === 0" class="empty-state" style="padding:24px 0;">
          <p class="muted">Sin datos de proyectos aún.</p>
        </div>
        <div v-else class="chart-list">
          <div
            v-for="(item, index) in pendingByProject"
            :key="item.id"
            class="chart-row group cursor-default table-row-enter"
            :style="{ animationDelay: (index * 0.1) + 's' }"
          >
            <span class="chart-row-label flex items-center gap-2" :title="item.nombre">
              <span class="w-1.5 h-1.5 rounded-full bg-brand-400 group-hover:scale-150 transition-transform"></span>
              {{ item.nombre }}
            </span>
            <div
              class="chart-bar relative overflow-hidden"
              :style="{ '--value': Math.round(((item.piezas_pendientes ?? item.total ?? 0) / maxPending) * 100) + '%' }"
            >
              <div class="absolute inset-0 bg-gradient-to-r from-brand-500/0 via-brand-500/10 to-brand-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <strong class="relative z-10">{{ item.piezas_pendientes ?? item.total ?? 0 }}</strong>
            </div>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
