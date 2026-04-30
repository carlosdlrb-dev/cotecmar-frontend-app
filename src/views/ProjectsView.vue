<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { piecesApi } from '../api/client'
import { useUiStore } from '../stores/ui'

const uiStore = useUiStore()
const loading = ref(true)
const projects = ref([])
const pagination = reactive({ currentPage: 1, lastPage: 1, total: 0 })
const showForm = ref(false)
const submitting = ref(false)

const form = reactive({ id: null, nombre: '', descripcion: '' })
const errors = reactive({ nombre: '', descripcion: '', general: '' })

const emptyState = computed(() => !loading.value && projects.value.length === 0)

const resetForm = () => { form.id = null; form.nombre = ''; form.descripcion = '' }
const resetErrors = () => { errors.nombre = ''; errors.descripcion = ''; errors.general = '' }

const openCreate = () => { resetForm(); resetErrors(); showForm.value = true }
const openEdit = (p) => {
  resetErrors()
  form.id = p.id; form.nombre = p.nombre; form.descripcion = p.descripcion || ''
  showForm.value = true
}

const fetchProjects = async (page = 1) => {
  loading.value = true
  try {
    const { data } = await piecesApi.get('/proyectos', { params: { page } })
    projects.value = data.data ?? []
    pagination.currentPage = data.meta?.current_page ?? 1
    pagination.lastPage    = data.meta?.last_page ?? 1
    pagination.total       = data.meta?.total ?? 0
  } catch {
    uiStore.showBanner({ type: 'error', title: 'Error al cargar', message: 'No se pudieron obtener los proyectos.' })
  } finally {
    loading.value = false
  }
}

const saveProject = async () => {
  resetErrors()
  if (!form.nombre) { errors.nombre = 'El nombre es obligatorio.'; return }

  submitting.value = true
  try {
    const payload = { nombre: form.nombre, descripcion: form.descripcion || null }
    if (form.id) {
      await piecesApi.put(`/proyectos/${form.id}`, payload)
      uiStore.showToast({ type: 'success', title: 'Proyecto actualizado', message: 'Los cambios se guardaron.' })
    } else {
      await piecesApi.post('/proyectos', payload)
      uiStore.showToast({ type: 'success', title: 'Proyecto creado', message: 'El proyecto fue registrado.' })
    }
    showForm.value = false
    await fetchProjects(pagination.currentPage)
  } catch (err) {
    if (err?.response?.status === 422) {
      const f = err.response.data?.errors ?? {}
      errors.nombre      = f.nombre?.[0] ?? ''
      errors.descripcion = f.descripcion?.[0] ?? ''
    }
    errors.general = err?.response?.data?.message || 'No se pudo guardar el proyecto.'
  } finally {
    submitting.value = false
  }
}

const deleteProject = async (p) => {
  if (!confirm(`¿Eliminar el proyecto "${p.nombre}"? Se eliminarán también sus bloques y piezas.`)) return
  try {
    await piecesApi.delete(`/proyectos/${p.id}`)
    uiStore.showToast({ type: 'success', title: 'Proyecto eliminado', message: p.nombre })
    await fetchProjects(pagination.currentPage)
  } catch {
    uiStore.showToast({ type: 'error', title: 'Error al eliminar', message: 'Intenta nuevamente.' })
  }
}

onMounted(() => fetchProjects())
</script>

<template>
  <section class="page space-y-4 sm:space-y-6">
    <div class="page-hero">
      <div class="page-hero-grid">
        <div class="page-hero-copy">
          <div class="page-hero-kicker">
            <span class="pill bounce-badge">LIVE</span>
            <span class="text-[11px] sm:text-xs uppercase tracking-[0.22em] text-slate-500 font-bold">Gestión de proyectos</span>
          </div>
          <h1 class="page-hero-title">Proyectos</h1>
          <p class="page-hero-text">Gestiona proyectos y accede a sus bloques y piezas desde una vista más limpia y consistente.</p>
          <div class="page-hero-chips">
            <span class="project-chip">{{ pagination.total }} total</span>
            <span class="project-chip">Bloques y piezas</span>
            <span class="project-chip">Edición rápida</span>
          </div>
        </div>
        <div class="page-hero-actions">
          <button class="primary-button magnetic-hover" @click="openCreate">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nuevo proyecto
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="panel page-panel p-4 sm:p-5 space-y-4">
      <div class="flex items-center justify-between gap-3">
        <div class="space-y-2 w-1/3">
          <div class="skeleton h-4 w-24"></div>
          <div class="skeleton h-3 w-40"></div>
        </div>
        <div class="skeleton h-9 w-28 rounded-full"></div>
      </div>

      <div class="overflow-hidden rounded-2xl border border-slate-100">
        <div class="grid grid-cols-[1.2fr_1.6fr_220px] gap-4 px-5 py-4 bg-slate-50 border-b border-slate-100">
          <div class="skeleton h-3 w-20"></div>
          <div class="skeleton h-3 w-24 hidden sm:block"></div>
          <div class="skeleton h-3 w-20"></div>
        </div>
        <div v-for="i in 4" :key="i" class="grid grid-cols-[1.2fr_1.6fr_220px] gap-4 px-5 py-4 border-b border-slate-50 items-center">
          <div class="space-y-2">
            <div class="skeleton h-4 w-40"></div>
            <div class="skeleton h-3 w-28 sm:hidden"></div>
          </div>
          <div class="skeleton h-4 w-56 hidden sm:block"></div>
          <div class="flex gap-2">
            <div class="skeleton h-9 w-20 rounded-full"></div>
            <div class="skeleton h-9 w-20 rounded-full"></div>
            <div class="skeleton h-9 w-20 rounded-full"></div>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between gap-3 pt-2">
        <div class="skeleton h-4 w-32"></div>
        <div class="flex items-center gap-3">
          <div class="skeleton h-9 w-24 rounded-full"></div>
          <div class="skeleton h-4 w-16"></div>
          <div class="skeleton h-9 w-24 rounded-full"></div>
        </div>
      </div>
    </div>

    <div v-else class="panel page-panel">
      <div v-if="emptyState" class="empty-state">
        <div class="empty-state-icon">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <h3>Sin proyectos registrados</h3>
        <p>Crea el primer proyecto para asociarle bloques y piezas.</p>
        <button class="primary-button" style="margin-top:8px;" @click="openCreate">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Crear proyecto
        </button>
      </div>

      <template v-else>
        <div class="overflow-x-auto -mx-4 sm:-mx-5 px-4 sm:px-5">
          <table class="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th class="hidden sm:table-cell">Descripción</th>
                <th style="width:220px; min-width:220px;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="project in projects" :key="project.id" class="group">
                <td style="font-weight:600;">
                  <div class="flex flex-col">
                    <span>{{ project.nombre }}</span>
                    <span class="sm:hidden text-xs text-slate-400 mt-1 truncate max-w-[200px]">{{ project.descripcion || 'Sin descripción' }}</span>
                  </div>
                </td>
                <td class="hidden sm:table-cell">{{ project.descripcion || '—' }}</td>
                <td>
                  <div class="table-actions">
                    <RouterLink
                      class="ghost-button text-xs sm:text-[13px] px-2 sm:px-3 py-1.5 sm:py-[7px]"
                      :to="`/proyectos/${project.id}/bloques`"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M4 4h7v7H4z"/>
                        <path d="M13 4h7v7h-7z"/>
                        <path d="M4 13h7v7H4z"/>
                        <path d="M13 13h7v7h-7z"/>
                      </svg>
                      <span class="hidden sm:inline">Bloques</span>
                      <span class="sm:hidden">Ver</span>
                    </RouterLink>
                    <button
                      class="ghost-button text-xs sm:text-[13px] px-2 sm:px-3 py-1.5 sm:py-[7px]"
                      @click="openEdit(project)"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5"/>
                        <path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Editar
                    </button>
                    <button
                      class="danger-button text-xs sm:text-[13px] px-2 sm:px-3 py-1.5 sm:py-[7px]"
                      @click="deleteProject(project)"
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
          <span>{{ pagination.total }} proyecto{{ pagination.total !== 1 ? 's' : '' }}</span>
          <div style="display:flex;gap:8px;align-items:center;">
            <button class="ghost-button" style="padding:7px 14px;" :disabled="pagination.currentPage <= 1" @click="fetchProjects(pagination.currentPage - 1)">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
              Anterior
            </button>
            <span style="font-size:13px;">{{ pagination.currentPage }} / {{ pagination.lastPage }}</span>
            <button class="ghost-button" style="padding:7px 14px;" :disabled="pagination.currentPage >= pagination.lastPage" @click="fetchProjects(pagination.currentPage + 1)">
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
    <Transition name="modal">
      <div v-if="showForm" class="modal-backdrop" @click.self="showForm = false">
        <div class="modal">
          <h2>{{ form.id ? 'Editar proyecto' : 'Nuevo proyecto' }}</h2>

          <label class="field">
            <span>Nombre *</span>
            <input v-model.trim="form.nombre" type="text" placeholder="Proyecto Atlas" autofocus />
            <small v-if="errors.nombre" class="field-error">{{ errors.nombre }}</small>
          </label>

          <label class="field">
            <span>Descripción</span>
            <textarea v-model.trim="form.descripcion" rows="3" placeholder="Descripción opcional del proyecto"></textarea>
            <small v-if="errors.descripcion" class="field-error">{{ errors.descripcion }}</small>
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
            <button class="primary-button" :disabled="submitting" @click="saveProject">
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
  </section>
</template>
