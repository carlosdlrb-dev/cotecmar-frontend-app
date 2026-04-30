import { defineStore } from 'pinia'

const STORAGE_KEY = 'cotecmar.auth'

function readStoredSession() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return { token: null, user: null }

    const parsed = JSON.parse(saved)
    if (parsed.expires_at && Date.now() > parsed.expires_at) {
      localStorage.removeItem(STORAGE_KEY)
      return { token: null, user: null }
    }

    return {
      token: parsed.token ?? null,
      user: parsed.user ?? null,
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return { token: null, user: null }
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    ...readStoredSession(),
    isLoading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.token),
    userName: (state) => state.user?.name || 'Usuario',
  },

  actions: {
    async initAuth() {
      // Restore synchronously so the router guard can evaluate isAuthenticated immediately
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (!saved) return

        const parsed = JSON.parse(saved)

        if (parsed.expires_at && Date.now() > parsed.expires_at) {
          this.clearSession()
          return
        }

        this.token = parsed.token ?? null
        this.user = parsed.user ?? null
      } catch {
        this.clearSession()
        return
      }

      if (!this.token) return

      // Async verification: confirm token is still active against the server
      this.isLoading = true
      try {
        const { authApi } = await import('../api/client.js')
        const { data } = await authApi.get('/me')
        this.user = data.user ?? this.user
        const current = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, user: this.user }))
      } catch (err) {
        if (err?.response?.status === 401) {
          this.clearSession()
        }
        // Network errors: keep local session (offline tolerance)
      } finally {
        this.isLoading = false
      }
    },

    setSession({ token, user, expires_in = 3600 }) {
      this.token = token
      this.user = user
      const expires_at = Date.now() + expires_in * 1000
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user, expires_at }))
    },

    async logout() {
      if (this.token) {
        try {
          const { authApi } = await import('../api/client.js')
          await authApi.post('/logout')
        } catch {
          // Always clear session, even on network errors
        }
      }
      this.clearSession()
    },

    clearSession() {
      this.token = null
      this.user = null
      this.error = null
      localStorage.removeItem(STORAGE_KEY)
    },
  },
})
