<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { piecesApi } from '../api/client'
import { useUiStore } from '../stores/ui'
import { useConfirmationModal } from '../stores/confirmationModal'

const route = useRoute()
const uiStore = useUiStore()
const confirmModal = useConfirmationModal()
const projectId = computed(() => route.params.id)

const loading = ref(true)
const project = ref(null)
const blocks = ref([])
const pagination = reactive({ currentPage: 1, lastPage: 1, total: 0 })
const showForm = ref(false)
const submitting = ref(false)

const form = reactive({ id: null, nombre: '', codigo: '' })
const errors = reactive({ nombre: '', codigo: '', general: '' })

const emptyState = computed(() => !loading.value && blocks.value.length === 0)

const resetForm = () => { form.id = null; form.nombre = ''; form.codigo = '' }
const resetErrors = () => { errors.nombre = ''; errors.codigo = ''; errors.general = '' }

const openCreate = () => { resetForm(); resetErrors(); showForm.value = true }
const openEdit = (b) => {
  resetErrors()
  form.id = b.id; form.nombre = b.nombre; form.codigo = b.codigo || ''
  showForm.value = true
}

const fetchProject = async () => {
  try {
    const { data } = await piecesApi.get(`/proyectos/${projectId.value}`)
    project.value = data
  } catch {
    project.value = null
  }
}

const fetchBlocks = async (page = 1) => {
  loading.value = true
  try {
    const { data } = await piecesApi.get(`/proyectos/${projectId.value}/bloques`, { params: { page } })
    blocks.value = data.data ?? []
    pagination.currentPage = data.meta?.current_page ?? 1
    pagination.lastPage    = data.meta?.last_page ?? 1
    pagination.total       = data.meta?.total ?? 0
  } catch {
    uiStore.showBanner({ type: 'error', title: 'Error al cargar', message: 'No se pudieron obtener los bloques.' })
  } finally {
    loading.value = false
  }
}

const saveBlock = async () => {
  resetErrors()
  if (!form.nombre) { errors.nombre = 'El nombre es obligatorio.'; return }

  submitting.value = true
  try {
    const payload = { nombre: form.nombre, codigo: form.codigo || null }
    if (form.id) {
      await piecesApi.put(`/bloques/${form.id}`, payload)
      uiStore.showToast({ type: 'success', title: 'Bloque actualizado', message: 'Los cambios se guardaron.' })
    } else {
      await piecesApi.post(`/proyectos/${projectId.value}/bloques`, payload)
      uiStore.showToast({ type: 'success', title: 'Bloque creado', message: 'El bloque fue registrado.' })
    }
    showForm.value = false
    await fetchBlocks(pagination.currentPage)
  } catch (err) {
    if (err?.response?.status === 422) {
      const f = err.response.data?.errors ?? {}
      errors.nombre = f.nombre?.[0] ?? ''
      errors.codigo = f.codigo?.[0] ?? ''
    }
    errors.general = err?.response?.data?.message || 'No se pudo guardar el bloque.'
  } finally {
    submitting.value = false
  }
}

const deleteBlock = (b) => {
  confirmModal.show({
    title: 'Eliminar bloque',
    message: `¿Eliminar el bloque "${b.nombre}"? Se eliminarán también sus piezas.`,
    onConfirm: async () => {
      try {
        await piecesApi.delete(`/bloques/${b.id}`)
        uiStore.showToast({ type: 'success', title: 'Bloque eliminado', message: b.nombre })
        await fetchBlocks(pagination.currentPage)
      } catch {
        uiStore.showToast({ type: 'error', title: 'Error al eliminar', message: 'Intenta nuevamente.' })
      }
    }
  })
}

onMounted(async () => {
  await fetchProject()
  await fetchBlocks()
})
</script>

<template>
  <section class="page">
    <div class="page-header">
      <div>
        <div class="breadcrumb mb-1.5 text-xs sm:text-sm">
          <RouterLink to="/proyectos">Proyectos</RouterLink>
          <span class="breadcrumb-sep">/</span>
          <span class="truncate max-w-[150px] sm:max-w-[300px] inline-block">{{ project?.nombre || '...' }}</span>
        </div>
        <h1 class="text-lg sm:text-[22px]">Bloques del proyecto</h1>
        <p class="text-xs sm:text-sm">{{ project?.nombre }} · Gestiona los bloques de construcción.</p>
      </div>
      <button class="primary-button magnetic-hover text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5" @click="openCreate">
        <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        <span class="hidden sm:inline">Nuevo bloque</span>
        <span class="sm:hidden">Nuevo</span>
      </button>
    </div>

    <div v-if="loading" class="panel page-panel p-4 sm:p-5 space-y-4">
      <div class="flex items-center justify-between gap-3">
        <div class="space-y-2 w-1/3">
          <div class="skeleton h-4 w-24"></div>
          <div class="skeleton h-3 w-36"></div>
        </div>
        <div class="skeleton h-9 w-28 rounded-full"></div>
      </div>

      <div class="overflow-hidden rounded-2xl border border-slate-100">
        <div class="grid grid-cols-[1.6fr_1fr_180px] gap-4 px-5 py-4 bg-slate-50 border-b border-slate-100">
          <div class="skeleton h-3 w-20"></div>
          <div class="skeleton h-3 w-16 hidden sm:block"></div>
          <div class="skeleton h-3 w-20"></div>
        </div>
        <div v-for="i in 4" :key="i" class="grid grid-cols-[1.6fr_1fr_180px] gap-4 px-5 py-4 border-b border-slate-50 items-center">
          <div class="space-y-2">
            <div class="skeleton h-4 w-40"></div>
            <div class="skeleton h-3 w-24 sm:hidden"></div>
          </div>
          <div class="skeleton h-4 w-24 hidden sm:block"></div>
          <div class="flex gap-2">
            <div class="skeleton h-9 w-16 rounded-full"></div>
            <div class="skeleton h-9 w-16 rounded-full"></div>
            <div class="skeleton h-9 w-16 rounded-full"></div>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between gap-3 pt-2">
        <div class="skeleton h-4 w-28"></div>
        <div class="flex items-center gap-3">
          <div class="skeleton h-9 w-24 rounded-full"></div>
          <div class="skeleton h-4 w-16"></div>
          <div class="skeleton h-9 w-24 rounded-full"></div>
        </div>
      </div>
    </div>

    <div v-else class="panel">
      <div v-if="emptyState" class="empty-state">
        <div class="empty-state-icon">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
            <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/>
          </svg>
        </div>
        <h3>Sin bloques registrados</h3>
        <p>Crea el primer bloque para este proyecto.</p>
        <button class="primary-button" style="margin-top:8px;" @click="openCreate">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Crear bloque
        </button>
      </div>

      <template v-else>
        <div class="overflow-x-auto -mx-4 sm:-mx-5 px-4 sm:px-5">
          <table class="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th class="hidden sm:table-cell">Código</th>
                <th style="width:180px; min-width:180px;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="block in blocks" :key="block.id" class="group">
                <td style="font-weight:600;">
                  <div class="flex flex-col">
                    <span>{{ block.nombre }}</span>
                    <div class="sm:hidden mt-1">
                      <code v-if="block.codigo" class="code-pill text-[10px] px-1.5 py-0.5">{{ block.codigo }}</code>
                      <span v-else class="text-xs text-slate-400">Sin código</span>
                    </div>
                  </div>
                </td>
                <td class="hidden sm:table-cell">
                  <code v-if="block.codigo" class="code-pill">{{ block.codigo }}</code>
                  <span v-else class="muted">—</span>
                </td>
                <td>
                  <div class="table-actions">
                    <RouterLink
                      class="ghost-button text-xs sm:text-[13px] px-2 sm:px-3 py-1.5 sm:py-[7px]"
                      :to="{ name: 'pieces', query: { proyecto_id: projectId, bloque_id: block.id } }"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/>
                      </svg>
                      <span class="hidden sm:inline">Piezas</span>
                      <span class="sm:hidden">Ver</span>
                    </RouterLink>
                    <button
                      class="ghost-button text-xs sm:text-[13px] px-2 sm:px-3 py-1.5 sm:py-[7px]"
                      @click="openEdit(block)"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5"/>
                        <path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Editar
                    </button>
                    <button
                      class="danger-button text-xs sm:text-[13px] px-2 sm:px-3 py-1.5 sm:py-[7px]"
                      @click="deleteBlock(block)"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 6h18"/>
                        <path d="M8 6V4h8v2"/>
                        <path d="M19 6l-1 14H6L5 6"/>
                        <path d="M10 11v6M14 11v6"/>
                      </svg>
                      <span class="hidden sm:inline">Eliminar</span>
                      <span class="sm:hidden">Del</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination">
          <span>{{ pagination.total }} bloque{{ pagination.total !== 1 ? 's' : '' }}</span>
          <div style="display:flex;gap:8px;align-items:center;">
            <button class="ghost-button" style="padding:7px 14px;" :disabled="pagination.currentPage <= 1" @click="fetchBlocks(pagination.currentPage - 1)">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
              Anterior
            </button>
            <span style="font-size:13px;">{{ pagination.currentPage }} / {{ pagination.lastPage }}</span>
            <button class="ghost-button" style="padding:7px 14px;" :disabled="pagination.currentPage >= pagination.lastPage" @click="fetchBlocks(pagination.currentPage + 1)">
              Siguiente
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 6l6 6-6 6"/>
              </svg>
            </button>
          </div>
        </div>
      </template>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showForm" class="modal-backdrop" @click.self="showForm = false">
          <div class="modal">
          <h2>{{ form.id ? 'Editar bloque' : 'Nuevo bloque' }}</h2>

          <label class="field">
            <span>Nombre *</span>
            <input v-model.trim="form.nombre" type="text" placeholder="Bloque Proa A" autofocus />
            <small v-if="errors.nombre" class="field-error">{{ errors.nombre }}</small>
          </label>

          <label class="field">
            <span>Código</span>
            <input v-model.trim="form.codigo" type="text" placeholder="B1A (opcional)" />
            <small v-if="errors.codigo" class="field-error">{{ errors.codigo }}</small>
          </label>

          <div v-if="errors.general" class="form-error">{{ errors.general }}</div>

          <div class="modal-actions">
            <button class="ghost-button" @click="showForm = false">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6L6 18"/>
                <path d="M6 6l12 12"/>
              </svg>
              Cancelar
            </button>
            <button class="primary-button" :disabled="submitting" @click="saveBlock">
              <svg v-if="!submitting" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              <span v-if="submitting" class="spinner"></span>
              {{ submitting ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>
