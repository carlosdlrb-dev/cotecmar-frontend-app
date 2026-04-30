<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { piecesApi } from '../api/client'
import { useUiStore } from '../stores/ui'
import { useConfirmationModal } from '../stores/confirmationModal'

const route = useRoute()
const uiStore = useUiStore()
const confirmModal = useConfirmationModal()

const loading = ref(true)
const pieces = ref([])
const projects = ref([])
const formBlocks = ref([])     // blocks for the modal form

const pagination = reactive({ currentPage: 1, lastPage: 1, total: 0 })

const filters = reactive({ proyecto_id: '', estado: '' })
const formProjectId = ref('')   // project selector inside the modal (separate from filter)

const form = reactive({
  id: null,
  bloque_id: '',
  codigo: '',
  peso_teorico: '',
  peso_real: '',
  estado: 'pendiente',
})
const errors = reactive({ bloque_id: '', peso_teorico: '', peso_real: '', general: '' })

const showForm = ref(false)
const submitting = ref(false)

const weightDiff = computed(() => {
  const t = Number(form.peso_teorico)
  const r = Number(form.peso_real)
  if (!form.peso_teorico || !form.peso_real) return '—'
  const diff = r - t
  return (diff >= 0 ? '+' : '') + diff.toFixed(3)
})
const weightDiffClass = computed(() => {
  const d = Number(form.peso_real) - Number(form.peso_teorico)
  if (!form.peso_real || !form.peso_teorico) return ''
  return d > 0 ? 'text-warning' : d < 0 ? 'text-danger' : 'text-success'
})

const emptyState = computed(() => !loading.value && pieces.value.length === 0)

const resetForm = () => {
  form.id = null; form.bloque_id = ''; form.codigo = ''
  form.peso_teorico = ''; form.peso_real = ''; form.estado = 'pendiente'
  formProjectId.value = ''
  formBlocks.value = []
}
const resetErrors = () => {
  errors.bloque_id = ''; errors.peso_teorico = ''; errors.peso_real = ''; errors.general = ''
}

const openCreate = () => { resetForm(); resetErrors(); showForm.value = true }
const openEdit = (p) => {
  resetErrors()
  form.id          = p.id
  form.bloque_id   = p.bloque_id ?? p.bloque?.id ?? ''
  form.codigo      = p.codigo ?? ''
  form.peso_teorico = p.peso_teorico
  form.peso_real    = p.peso_real
  form.estado       = p.estado
  formProjectId.value = p.bloque?.proyecto_id ?? p.proyecto_id ?? ''
  showForm.value = true
  if (formProjectId.value) fetchFormBlocks(formProjectId.value)
}

const fetchProjects = async () => {
  try {
    const { data } = await piecesApi.get('/proyectos', { params: { per_page: 100 } })
    projects.value = data.data ?? []
  } catch { projects.value = [] }
}

const fetchFormBlocks = async (projectId) => {
  if (!projectId) { formBlocks.value = []; form.bloque_id = ''; return }
  try {
    const { data } = await piecesApi.get(`/proyectos/${projectId}/bloques`, { params: { per_page: 100 } })
    formBlocks.value = data.data ?? []
  } catch { formBlocks.value = [] }
}

const fetchPieces = async (page = 1) => {
  loading.value = true
  try {
    const { data } = await piecesApi.get('/piezas', {
      params: {
        page,
        proyecto_id: filters.proyecto_id || undefined,
        estado: filters.estado || undefined,
      },
    })
    pieces.value = data.data ?? []
    pagination.currentPage = data.meta?.current_page ?? 1
    pagination.lastPage    = data.meta?.last_page ?? 1
    pagination.total       = data.meta?.total ?? 0
  } catch {
    uiStore.showBanner({ type: 'error', title: 'Error al cargar', message: 'No se pudieron obtener las piezas.' })
  } finally {
    loading.value = false
  }
}

const savePiece = async () => {
  resetErrors()
  let valid = true
  if (!form.bloque_id)   { errors.bloque_id = 'Selecciona un bloque.'; valid = false }
  if (!form.peso_teorico) { errors.peso_teorico = 'Peso teórico obligatorio.'; valid = false }
  if (!form.peso_real)    { errors.peso_real = 'Peso real obligatorio.'; valid = false }
  if (!valid) return

  submitting.value = true
  try {
    const payload = {
      codigo: form.codigo || null,
      peso_teorico: Number(form.peso_teorico),
      peso_real:    Number(form.peso_real),
      estado:       form.estado,
    }
    if (form.id) {
      await piecesApi.put(`/piezas/${form.id}`, payload)
      uiStore.showToast({ type: 'success', title: 'Pieza actualizada', message: 'Los cambios se guardaron.' })
    } else {
      await piecesApi.post(`/bloques/${form.bloque_id}/piezas`, payload)
      uiStore.showToast({ type: 'success', title: 'Pieza creada', message: 'La pieza fue registrada.' })
    }
    showForm.value = false
    await fetchPieces(pagination.currentPage)
  } catch (err) {
    if (err?.response?.status === 422) {
      const f = err.response.data?.errors ?? {}
      errors.peso_teorico = f.peso_teorico?.[0] ?? ''
      errors.peso_real    = f.peso_real?.[0] ?? ''
      errors.bloque_id    = f.bloque_id?.[0] ?? ''
    }
    errors.general = err?.response?.data?.message || 'No se pudo guardar la pieza.'
  } finally {
    submitting.value = false
  }
}

const deletePiece = (p) => {
  const label = p.codigo ? `"${p.codigo}"` : `pieza #${p.id}`
  confirmModal.show({
    title: 'Eliminar pieza',
    message: `¿Eliminar la ${label}?`,
    onConfirm: async () => {
      try {
        await piecesApi.delete(`/piezas/${p.id}`)
        uiStore.showToast({ type: 'success', title: 'Pieza eliminada', message: p.codigo || `#${p.id}` })
        await fetchPieces(pagination.currentPage)
      } catch {
        uiStore.showToast({ type: 'error', title: 'Error al eliminar', message: 'Intenta nuevamente.' })
      }
    }
  })
}

const pieceDiff = (p) => {
  const d = Number(p.peso_real) - Number(p.peso_teorico)
  return (d >= 0 ? '+' : '') + d.toFixed(3)
}
const diffClass = (p) => {
  const d = Number(p.peso_real) - Number(p.peso_teorico)
  return d > 0 ? 'text-warning' : d < 0 ? 'text-danger' : 'text-success'
}

// Watchers
watch(() => filters.proyecto_id, () => fetchPieces(1))
watch(() => filters.estado, () => fetchPieces(1))
watch(formProjectId, (v) => { form.bloque_id = ''; fetchFormBlocks(v) })

onMounted(async () => {
  await fetchProjects()

  // Pre-fill filters from query params (e.g. coming from the blocks view)
  const qProyecto = route.query.proyecto_id
  const qBloque   = route.query.bloque_id
  if (qProyecto) {
    filters.proyecto_id = String(qProyecto)
  }

  await fetchPieces()

  // If a specific block was passed, open the form pre-filled
  if (qProyecto && qBloque) {
    await fetchFormBlocks(qProyecto)
    formProjectId.value = String(qProyecto)
    form.bloque_id      = String(qBloque)
    showForm.value      = true
  }
})
</script>

<template>
  <section class="page space-y-4 sm:space-y-6">
    <div class="page-hero">
      <div class="page-hero-grid">
        <div class="page-hero-copy">
          <div class="page-hero-kicker">
            <span class="pill bounce-badge">LIVE</span>
            <span class="text-[11px] sm:text-xs uppercase tracking-[0.22em] text-slate-500 font-bold">Control de piezas</span>
          </div>
          <h1 class="page-hero-title">Piezas</h1>
          <p class="page-hero-text">Filtra por proyecto y estado para controlar la fabricación con más aire visual y mejor jerarquía.</p>
          <div class="page-hero-chips">
            <!-- <span class="project-chip">{{ pagination.total }} piezas</span> -->
            <span class="project-chip">{{ projects.length }} proyectos</span>
            <span class="project-chip">Estados en vivo</span>
          </div>
        </div>
        <div class="page-hero-actions">
          <button class="primary-button magnetic-hover group" @click="openCreate">
            <svg class="transition-transform group-hover:rotate-90" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nueva pieza
          </button>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="panel page-panel px-4 sm:px-5 py-4 sm:py-5">
      <div class="filters mb-0">
      <label class="field">
        <span>Proyecto</span>
        <select v-model="filters.proyecto_id">
          <option value="">Todos los proyectos</option>
          <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.nombre }}</option>
        </select>
      </label>
      <label class="field">
        <span>Estado</span>
        <select v-model="filters.estado">
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="fabricada">Fabricada</option>
        </select>
      </label>
      </div>
    </div>

    <div v-if="loading" class="panel page-panel skeleton"></div>

    <div v-else class="panel page-panel">
      <div v-if="emptyState" class="empty-state animate-scale-in">
        <div class="empty-state-icon animate-bounce-in">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
            <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/>
            <line x1="12" y1="22" x2="12" y2="15.5"/>
            <polyline points="22 8.5 12 15.5 2 8.5"/>
          </svg>
        </div>
        <h3 class="animate-fade-up stagger-1">Sin piezas registradas</h3>
        <p class="animate-fade-up stagger-2">Ajusta los filtros o crea la primera pieza del proyecto.</p>
        <button class="primary-button magnetic-hover animate-fade-up stagger-3" style="margin-top:16px;" @click="openCreate">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Crear pieza
        </button>
      </div>

      <template v-else>
        <div class="overflow-x-auto -mx-4 sm:-mx-5 px-4 sm:px-5">
          <table class="table">
            <thead>
              <tr>
                <th>Código</th>
                <th class="hidden lg:table-cell">Proyecto</th>
                <th class="hidden md:table-cell">Bloque</th>
                <th class="hidden sm:table-cell">Peso teórico</th>
                <th>Peso real</th>
                <th class="hidden sm:table-cell">Diferencia</th>
                <th>Estado</th>
                <th style="width:160px; min-width:160px;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(piece, index) in pieces"
                :key="piece.id"
                class="table-row-enter group"
                :style="{ animationDelay: (index * 0.05) + 's' }"
              >
                <td>
                  <code v-if="piece.codigo" class="code-pill group-hover:scale-105 transition-transform inline-block">{{ piece.codigo }}</code>
                  <span v-else class="muted">—</span>
                  <div class="lg:hidden mt-1 text-xs text-slate-400">
                    {{ piece.bloque?.proyecto?.nombre || piece.proyecto?.nombre || '—' }}
                  </div>
                </td>
                <td class="hidden lg:table-cell group-hover:text-brand-700 transition-colors">{{ piece.bloque?.proyecto?.nombre || piece.proyecto?.nombre || '—' }}</td>
                <td class="hidden md:table-cell">{{ piece.bloque?.nombre || '—' }}</td>
                <td class="hidden sm:table-cell font-mono">{{ Number(piece.peso_teorico).toFixed(3) }} kg</td>
                <td class="font-mono">
                  {{ Number(piece.peso_real).toFixed(3) }} kg
                  <span class="sm:hidden text-xs text-slate-400 block">
                    T: {{ Number(piece.peso_teorico).toFixed(1) }}
                  </span>
                </td>
                <td :class="diffClass(piece)" class="hidden sm:table-cell font-semibold font-mono">{{ pieceDiff(piece) }} kg</td>
                <td>
                  <span
                    class="status transition-all duration-300 group-hover:scale-110 group-hover:shadow-sm text-[10px] sm:text-[11px]"
                    :data-state="piece.estado"
                  >
                    {{ piece.estado }}
                  </span>
                </td>
                <td>
                  <div class="table-actions opacity-70 group-hover:opacity-100 transition-opacity">
                    <button
                      class="ghost-button magnetic-hover text-xs sm:text-[13px] px-2 sm:px-3 py-1.5 sm:py-[7px]"
                      @click="openEdit(piece)"
                    >
                      <svg class="w-3.5 h-3.5 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                      <span class="hidden sm:inline">Editar</span>
                    </button>
                    <button
                      class="danger-button magnetic-hover text-xs sm:text-[13px] px-2 sm:px-3 py-1.5 sm:py-[7px]"
                      @click="deletePiece(piece)"
                    >
                      <svg class="w-3.5 h-3.5 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                      <span class="hidden sm:inline">Eliminar</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination">
          <!-- <span>{{ pagination.total }} pieza{{ pagination.total !== 1 ? 's' : '' }}</span> -->
          <div style="display:flex;gap:8px;align-items:center;">
            <button class="ghost-button" style="padding:7px 14px;" :disabled="pagination.currentPage <= 1" @click="fetchPieces(pagination.currentPage - 1)">← Anterior</button>
            <span style="font-size:13px;">{{ pagination.currentPage }} / {{ pagination.lastPage }}</span>
            <button class="ghost-button" style="padding:7px 14px;" :disabled="pagination.currentPage >= pagination.lastPage" @click="fetchPieces(pagination.currentPage + 1)">Siguiente →</button>
          </div>
        </div>
      </template>
    </div>

    <!-- Modal -->
    <Teleport to="body">
    <Transition name="modal">
      <div v-if="showForm" class="modal-backdrop" @click.self="showForm = false">
        <div class="modal relative overflow-hidden">
          <!-- Decorative gradient line at top -->
          <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600"></div>

          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-brand-600">
              <svg v-if="form.id" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
            </div>
            <h2 class="text-xl font-black text-slate-900">{{ form.id ? 'Editar pieza' : 'Nueva pieza' }}</h2>
          </div>

          <div class="space-y-5">
            <div class="grid grid-cols-2 gap-4">
              <label class="field">
                <span class="flex items-center gap-1">
                  Proyecto
                  <span class="text-brand-500">*</span>
                </span>
                <select v-model="formProjectId" class="transition-all focus:ring-2 focus:ring-brand-500/20">
                  <option value="">Selecciona un proyecto</option>
                  <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.nombre }}</option>
                </select>
              </label>

              <label class="field">
                <span class="flex items-center gap-1">
                  Bloque
                  <span class="text-brand-500">*</span>
                </span>
                <select v-model="form.bloque_id" :disabled="!formProjectId" class="transition-all focus:ring-2 focus:ring-brand-500/20">
                  <option value="">{{ formProjectId ? 'Selecciona un bloque' : 'Elige proyecto primero' }}</option>
                  <option v-for="b in formBlocks" :key="b.id" :value="b.id">{{ b.nombre }}</option>
                </select>
                <small v-if="errors.bloque_id" class="field-error animate-pulse">{{ errors.bloque_id }}</small>
              </label>
            </div>

            <label class="field">
              <span>Código (opcional)</span>
              <input v-model.trim="form.codigo" type="text" placeholder="Ej: P1A" class="transition-all focus:ring-2 focus:ring-brand-500/20" />
            </label>

            <div class="grid grid-cols-2 gap-4">
              <label class="field">
                <span class="flex items-center gap-1">
                  Peso teórico (kg)
                  <span class="text-brand-500">*</span>
                </span>
                <input v-model.number="form.peso_teorico" type="number" step="0.001" min="0" placeholder="0.000" class="font-mono transition-all focus:ring-2 focus:ring-brand-500/20" />
                <small v-if="errors.peso_teorico" class="field-error animate-pulse">{{ errors.peso_teorico }}</small>
              </label>
              <label class="field">
                <span class="flex items-center gap-1">
                  Peso real (kg)
                  <span class="text-brand-500">*</span>
                </span>
                <input v-model.number="form.peso_real" type="number" step="0.001" min="0" placeholder="0.000" class="font-mono transition-all focus:ring-2 focus:ring-brand-500/20" />
                <small v-if="errors.peso_real" class="field-error animate-pulse">{{ errors.peso_real }}</small>
              </label>
            </div>

            <div class="weight-diff bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200">
              <span class="text-[13px] text-slate-500 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                </svg>
                Diferencia calculada
              </span>
              <strong :class="[weightDiffClass, 'font-mono text-lg']">{{ weightDiff }} kg</strong>
            </div>

            <label class="field">
              <span class="flex items-center gap-1">
                Estado
                <span class="text-brand-500">*</span>
              </span>
              <select v-model="form.estado" class="transition-all focus:ring-2 focus:ring-brand-500/20">
                <option value="pendiente">🟡 Pendiente</option>
                <option value="fabricada">🟢 Fabricada</option>
              </select>
            </label>

            <Transition name="form-error">
              <div v-if="errors.general" class="form-error flex items-center gap-2">
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                {{ errors.general }}
              </div>
            </Transition>
          </div>

          <div class="modal-actions pt-4 border-t border-slate-100 mt-6">
            <button class="ghost-button magnetic-hover" @click="showForm = false">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
              Cancelar
            </button>
            <button class="primary-button magnetic-hover shimmer-btn" :disabled="submitting" @click="savePiece">
              <span v-if="submitting" class="spinner relative z-10"></span>
              <span v-else class="relative z-10 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                {{ form.id ? 'Actualizar' : 'Guardar' }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
    </Teleport>

  </section>
</template>
