import axios from 'axios'
import router from '../router'
import { useAuthStore } from '../stores/auth'
import { useUiStore } from '../stores/ui'

function handle401() {
  const authStore = useAuthStore()
  const uiStore = useUiStore()
  authStore.clearSession()
  uiStore.showToast({
    type: 'warning',
    title: 'Sesión expirada',
    message: 'Inicia sesión nuevamente para continuar.',
  })
  if (router.currentRoute.value.name !== 'login') {
    router.replace({ name: 'login' })
  }
}

function addAuthHeader(config) {
  const authStore = useAuthStore()
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }
  return config
}

function errorHandler(error) {
  if (error?.response?.status === 401) handle401()
  return Promise.reject(error)
}

export const authApi = axios.create({
  baseURL: import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:8000/api',
  timeout: 12000,
  headers: { Accept: 'application/json' },
})
authApi.interceptors.request.use(addAuthHeader)

export const piecesApi = axios.create({
  baseURL: import.meta.env.VITE_PIECES_API_URL || 'http://localhost:8001/api/v1',
  timeout: 12000,
  headers: { Accept: 'application/json' },
})
piecesApi.interceptors.request.use(addAuthHeader)
piecesApi.interceptors.response.use((r) => r, errorHandler)

const api = axios.create({
  timeout: 12000,
  headers: { Accept: 'application/json' },
})
api.interceptors.request.use(addAuthHeader)
api.interceptors.response.use((r) => r, errorHandler)

export default api
