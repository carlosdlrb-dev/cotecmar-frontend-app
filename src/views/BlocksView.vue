<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { piecesApi } from '../api/client'
import { useUiStore } from '../stores/ui'
import { useConfirmationModal } from '../stores/confirmationModal'

const uiStore = useUiStore()
const confirmModal = useConfirmationModal()

const loading = ref(true)
const blocks = ref([])
const projects = ref([])

const pagination = reactive({ currentPage: 1, lastPage: 1, total: 0 })
const filters = reactive({ proyecto_id: '' })

const form = reactive({ id: null, nombre: '', codigo: '', proyecto_id: '' })
const errors = reactive({ nombre: '', codigo: '', proyecto_id: '', general: '' })

const showForm = ref(false)
const submitting = ref(false)
const selectedProject = ref(null)

const emptyState = computed(() => !loading.value && blocks.value.length === 0)

const resetForm = () => { form.id = null; form.nombre = ''; form.codigo = ''; form.proyecto_id = '' }
const resetErrors = () => { errors.nombre = ''; errors.codigo = ''; errors.proyecto_id = ''; errors.general = '' }

const openCreate = () => {
  resetForm()
  resetErrors()
  selectedProject.value = ''
  showForm.value = true
}

const openEdit = (b) => {
  resetErrors()
  form.id = b.id
  form.nombre = b.nombre
  form.codigo = b.codigo || ''
  form.proyecto_id = b.proyecto_id || b.proyecto?.id || ''
  selectedProject.value = b.proyecto
  showForm.value = true
}

const fetchProjects = async () => {
  try {
    const { data } = await piecesApi.get('/proyectos', { params: { per_page: 100 } })
    projects.value = data.data ?? []
  } catch {
    projects.value = []
  }
}

const fetchBlocks = async (page = 1) => {
  loading.value = true
  try {
    const { data } = await piecesApi.get('/bloques', {
      params: {
        page,
        proyecto_id: filters.proyecto_id || undefined,
      },
    })
    blocks.value = data.data ?? []
    pagination.currentPage = data.meta?.current_page ?? 1
    pagination.lastPage = data.meta?.last_page ?? 1
    pagination.total = data.meta?.total ?? 0
  } catch {
    uiStore.showBanner({ type: 'error', title: 'Error al cargar', message: 'No se pudieron obtener los bloques.' })
  } finally {
    loading.value = false
  }
}

const saveBlock = async () => {
  resetErrors()
  let valid = true
  if (!form.nombre) {
    errors.nombre = 'El nombre es obligatorio.'
    valid = false
  }
  if (!form.id && !form.proyecto_id) {
    errors.proyecto_id = 'Selecciona un proyecto.'
    valid = false
  }
  if (!valid) return

  submitting.value = true
  try {
    const payload = { nombre: form.nombre, codigo: form.codigo || null }
    if (form.id) {
      await piecesApi.put(`/bloques/${form.id}`, payload)
      uiStore.showToast({ type: 'success', title: 'Bloque actualizado', message: 'Los cambios se guardaron.' })
    } else {
      await piecesApi.post(`/proyectos/${form.proyecto_id}/bloques`, payload)
      uiStore.showToast({ type: 'success', title: 'Bloque creado', message: 'El bloque fue registrado.' })
    }
    showForm.value = false
    await fetchBlocks(pagination.currentPage)
  } catch (err) {
    if (err?.response?.status === 422) {
      const f = err.response.data?.errors ?? {}
      errors.nombre = f.nombre?.[0] ?? ''
      errors.codigo = f.codigo?.[0] ?? ''
      errors.proyecto_id = f.proyecto_id?.[0] ?? ''
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

watch(() => filters.proyecto_id, () => fetchBlocks(1))

onMounted(async () => {
  await fetchProjects()
  await fetchBlocks()
})
</script>

<template>
  <section class="page space-y-4 sm:space-y-6">
    <div class="page-hero">
      <div class="page-hero-grid">
        <div class="page-hero-copy">
          <div class="page-hero-kicker">
            <span class="pill bounce-badge">LIVE</span>
            <span class="text-[11px] sm:text-xs uppercase tracking-[0.22em] text-slate-500 font-bold">Gestión de bloques</span>
          </div>
          <h1 class="page-hero-title">Bloques</h1>
          <p class="page-hero-text">Vista global de todos los bloques del sistema. Filtra por proyecto y gestiona la estructura de construcción.</p>
          <div class="page-hero-chips">
            <!-- <span class="project-chip">{{ pagination.total }} bloques</span> -->
            <span class="project-chip">{{ projects.length }} proyectos</span>
            <span class="project-chip">Gestión centralizada</span>
          </div>
        </div>
        <div class="page-hero-actions">
          <button class="primary-button magnetic-hover group" @click="openCreate">
            <svg class="transition-transform group-hover:rotate-90" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nuevo bloque
          </button>
        </div>
      </div>
    </div>

    <!-- Filter -->
    <div class="panel page-panel px-4 sm:px-5 py-4 sm:py-5">
      <div class="filters mb-0">
        <label class="field">
          <span>Proyecto</span>
          <select v-model="filters.proyecto_id">
            <option value="">Todos los proyectos</option>
            <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.nombre }}</option>
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
          </svg>
        </div>
        <h3 class="animate-fade-up stagger-1">Sin bloques registrados</h3>
        <p class="animate-fade-up stagger-2">Crea el primer bloque del sistema.</p>
        <button class="primary-button magnetic-hover animate-fade-up stagger-3" style="margin-top:16px;" @click="openCreate">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
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
                <th class="hidden sm:table-cell">Proyecto</th>
                <th class="hidden md:table-cell">Código</th>
                <th style="width:160px; min-width:160px;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(block, index) in blocks"
                :key="block.id"
                class="table-row-enter group"
                :style="{ animationDelay: (index * 0.05) + 's' }"
              >
                <td style="font-weight: 600;">
                  <div class="flex flex-col">
                    <span>{{ block.nombre }}</span>
                    <div class="sm:hidden mt-1 text-xs text-slate-400">
                      {{ block.proyecto?.nombre || '—' }}
                    </div>
                  </div>
                </td>
                <td class="hidden sm:table-cell group-hover:text-brand-700 transition-colors">{{ block.proyecto?.nombre || '—' }}</td>
                <td class="hidden md:table-cell">
                  <code v-if="block.codigo" class="code-pill group-hover:scale-105 transition-transform inline-block">{{ block.codigo }}</code>
                  <span v-else class="muted">—</span>
                </td>
                <td>
                  <div class="table-actions opacity-70 group-hover:opacity-100 transition-opacity">
                    <button
                      class="ghost-button magnetic-hover text-xs sm:text-[13px] px-2 sm:px-3 py-1.5 sm:py-[7px]"
                      @click="openEdit(block)"
                    >
                      <svg class="w-3.5 h-3.5 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                      <span class="hidden sm:inline">Editar</span>
                    </button>
                    <button
                      class="danger-button magnetic-hover text-xs sm:text-[13px] px-2 sm:px-3 py-1.5 sm:py-[7px]"
                      @click="deleteBlock(block)"
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
          <!-- <span>{{ pagination.total }} bloque{{ pagination.total !== 1 ? 's' : '' }}</span> -->
          <div style="display:flex;gap:8px;align-items:center;">
            <button class="ghost-button" style="padding:7px 14px;" :disabled="pagination.currentPage <= 1" @click="fetchBlocks(pagination.currentPage - 1)">← Anterior</button>
            <span style="font-size:13px;">{{ pagination.currentPage }} / {{ pagination.lastPage }}</span>
            <button class="ghost-button" style="padding:7px 14px;" :disabled="pagination.currentPage >= pagination.lastPage" @click="fetchBlocks(pagination.currentPage + 1)">Siguiente →</button>
          </div>
        </div>
      </template>
    </div>

    <!-- Modal (teleported to body to avoid stacking/context issues) -->
    <Teleport to="body">
      <div v-if="showForm" class="modal-backdrop" @click.self="showForm = false">
        <div class="modal">
          <h2>{{ form.id ? 'Editar bloque' : 'Crear bloque' }}</h2>

          <label class="field">
            <span>Proyecto <span v-if="!form.id" style="color:var(--c-danger)">*</span></span>
            <select v-model="form.proyecto_id" :disabled="!!form.id">
              <option value="">{{ form.id ? (selectedProject?.nombre || '—') : 'Selecciona un proyecto' }}</option>
              <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.nombre }}</option>
            </select>
            <small v-if="errors.proyecto_id" class="field-error">{{ errors.proyecto_id }}</small>
          </label>

          <label class="field">
            <span>Nombre <span style="color:var(--c-danger)">*</span></span>
            <input v-model="form.nombre" type="text" placeholder="Ej: Bloque A" />
            <small v-if="errors.nombre" class="field-error">{{ errors.nombre }}</small>
          </label>

          <label class="field">
            <span>Código</span>
            <input v-model="form.codigo" type="text" placeholder="Ej: BLK-001" />
            <small v-if="errors.codigo" class="field-error">{{ errors.codigo }}</small>
          </label>

          <div v-if="errors.general" class="form-error">{{ errors.general }}</div>

          <div class="modal-actions">
            <button class="ghost-button" @click="showForm = false">Cancelar</button>
            <button class="primary-button" :disabled="submitting" @click="saveBlock">
              {{ submitting ? 'Guardando...' : form.id ? 'Actualizar' : 'Crear' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>
