<script setup>
import { computed, onMounted, ref } from 'vue'
import { piecesApi } from '../api/client'
import { useUiStore } from '../stores/ui'

const uiStore = useUiStore()
const pendingByProject = ref([])
const totalsByState = ref([])
const loading = ref(true)
const refreshing = ref(false)

const maxPending = computed(() =>
  Math.max(1, ...pendingByProject.value.map((p) => p.piezas_pendientes ?? p.total ?? 0))
)
const totalPieces = computed(() =>
  totalsByState.value.reduce((s, i) => s + (i.total ?? 0), 0)
)

const fetchReports = async (isRefresh = false) => {
  if (isRefresh) refreshing.value = true
  else loading.value = true
  try {
    const [pendingRes, totalsRes] = await Promise.all([
      piecesApi.get('/reportes/pendientes-por-proyecto'),
      piecesApi.get('/reportes/totales-por-estado'),
    ])
    pendingByProject.value = pendingRes.data ?? []
    totalsByState.value    = totalsRes.data ?? []
  } catch {
    uiStore.showBanner({ type: 'error', title: 'Error al cargar reportes', message: 'Intenta nuevamente en unos segundos.' })
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

onMounted(() => fetchReports())
</script>

<template>
  <section class="page space-y-4 sm:space-y-6">
    <div class="page-hero">
      <div class="page-hero-grid">
        <div class="page-hero-copy">
          <div class="page-hero-kicker">
            <span class="pill bounce-badge">LIVE</span>
            <span class="text-[11px] sm:text-xs uppercase tracking-[0.22em] text-slate-500 font-bold">Analítica</span>
          </div>
          <h1 class="page-hero-title">Reportes</h1>
          <p class="page-hero-text">Análisis de piezas pendientes vs fabricadas por proyecto en una composición más limpia y alineada.</p>
          <div class="page-hero-chips">
            <span class="project-chip">{{ pendingByProject.length }} proyectos</span>
            <span class="project-chip">{{ totalPieces }} piezas</span>
            <span class="project-chip">Resumen en vivo</span>
          </div>
        </div>
        <div class="page-hero-actions">
          <button class="ghost-button text-xs sm:text-sm px-2.5 sm:px-4 py-1.5 sm:py-2.5" :disabled="refreshing" @click="fetchReports(true)">
            <svg
              class="w-3.5 h-3.5 sm:w-4 sm:h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              :style="{ animation: refreshing ? 'spin 0.7s linear infinite' : 'none' }"
            >
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            <span class="hidden sm:inline">{{ refreshing ? 'Actualizando...' : 'Actualizar' }}</span>
            <span class="sm:hidden">{{ refreshing ? '...' : '↻' }}</span>
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="grid-two">
      <div class="panel page-panel p-4 sm:p-5 space-y-4">
        <div class="flex items-center justify-between gap-3">
          <div class="space-y-2">
            <div class="skeleton h-4 w-28"></div>
            <div class="skeleton h-3 w-40"></div>
          </div>
          <div class="skeleton h-8 w-20 rounded-full"></div>
        </div>
        <div class="space-y-3">
          <div v-for="i in 4" :key="'pending-' + i" class="flex items-center gap-3">
            <div class="skeleton h-3 w-32"></div>
            <div class="skeleton h-9 flex-1 rounded-2xl"></div>
          </div>
        </div>
      </div>
      <div class="panel page-panel p-4 sm:p-5 space-y-4">
        <div class="flex items-center justify-between gap-3">
          <div class="space-y-2">
            <div class="skeleton h-4 w-28"></div>
            <div class="skeleton h-3 w-36"></div>
          </div>
          <div class="skeleton h-8 w-20 rounded-full"></div>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div v-for="i in 3" :key="'state-' + i" class="rounded-2xl border border-slate-100 bg-white p-4 space-y-3">
            <div class="skeleton h-14 rounded-full"></div>
            <div class="skeleton h-3 w-14 mx-auto"></div>
            <div class="skeleton h-3 w-10 mx-auto"></div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="grid-two">
      <!-- Pending by project -->
      <article class="panel page-panel">
        <div class="panel-header flex-col sm:flex-row items-start sm:items-center gap-2">
          <h2 class="text-sm sm:text-[15px]">Pendientes por proyecto</h2>
          <span class="pill text-[10px]">{{ pendingByProject.length }} proyectos</span>
        </div>

        <div v-if="pendingByProject.length === 0" class="empty-state py-6 sm:py-8">
          <div class="empty-state-icon w-10 h-10 sm:w-12 sm:h-12">
            <svg class="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
              <line x1="2" y1="20" x2="22" y2="20"/>
            </svg>
          </div>
          <p class="muted text-xs sm:text-sm">Sin datos disponibles.</p>
        </div>

        <div v-else class="chart-list px-3 sm:px-5 py-3 sm:py-5">
          <div
            v-for="item in pendingByProject"
            :key="item.id ?? item.proyecto_id"
            class="chart-row"
          >
            <span class="chart-row-label text-xs sm:text-sm truncate max-w-[120px] sm:max-w-[160px]" :title="item.nombre">{{ item.nombre }}</span>
            <div
              class="chart-bar"
              :style="{
                '--value': Math.round(((item.piezas_pendientes ?? item.total ?? 0) / maxPending) * 100) + '%',
              }"
            >
              <strong class="text-xs sm:text-sm">{{ item.piezas_pendientes ?? item.total ?? 0 }}</strong>
            </div>
          </div>
        </div>
      </article>

      <!-- Totals by state -->
      <article class="panel page-panel">
        <div class="panel-header flex-col sm:flex-row items-start sm:items-center gap-2">
          <h2 class="text-sm sm:text-[15px]">Totales por estado</h2>
          <span class="pill text-[10px]">{{ totalPieces }} piezas</span>
        </div>

        <div v-if="totalsByState.length === 0" class="empty-state py-6 sm:py-8">
          <p class="muted text-xs sm:text-sm">Sin datos disponibles.</p>
        </div>

        <template v-else>
          <div class="donut-grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 px-3 sm:px-5 py-3 sm:py-5">
            <div v-for="item in totalsByState" :key="item.estado" class="donut-card p-2 sm:p-4">
              <div class="donut w-10 h-10 sm:w-14 sm:h-14 text-xs sm:text-sm" :data-state="item.estado">{{ item.total ?? 0 }}</div>
              <p class="donut-label text-[10px] sm:text-xs mt-1 sm:mt-2">{{ item.estado }}</p>
              <p class="text-[10px] text-center text-slate-500 mt-0.5">
                {{ totalPieces ? Math.round(((item.total ?? 0) / totalPieces) * 100) : 0 }}%
              </p>
            </div>
          </div>

          <!-- Progress bars -->
          <div class="mt-4 sm:mt-5 px-3 sm:px-5 pb-4 sm:pb-5 flex flex-col gap-2 sm:gap-2.5">
            <div v-for="item in totalsByState" :key="'bar-' + item.estado">
              <div class="flex justify-between text-[11px] sm:text-xs mb-1">
                <span class="font-semibold capitalize">{{ item.estado }}</span>
                <span class="muted">{{ item.total }} piezas</span>
              </div>
              <div class="bg-slate-100 rounded-full h-1.5 sm:h-2 overflow-hidden">
                <div
                  :style="{
                    width: totalPieces ? Math.round(((item.total ?? 0) / totalPieces) * 100) + '%' : '0%',
                  }"
                  class="h-full rounded-full transition-[width] duration-700 ease-[cubic-bezier(0.34,1.2,0.64,1)]"
                  :class="item.estado === 'fabricada' ? 'bg-emerald-500' : 'bg-amber-500'"
                ></div>
              </div>
            </div>
          </div>
        </template>
      </article>
    </div>
  </section>
</template>
