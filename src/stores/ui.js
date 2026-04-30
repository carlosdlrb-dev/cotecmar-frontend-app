import { defineStore } from 'pinia'

let toastId = 0

export const useUiStore = defineStore('ui', {
  state: () => ({
    toasts: [],
    banner: null,
    loading: false,
  }),
  actions: {
    showToast({ type = 'info', title, message, duration = 3500 }) {
      const id = toastId++
      this.toasts.push({ id, type, title, message })
      if (duration) {
        setTimeout(() => this.removeToast(id), duration)
      }
    },
    removeToast(id) {
      this.toasts = this.toasts.filter((toast) => toast.id !== id)
    },
    showBanner({ type = 'error', title, message }) {
      this.banner = { type, title, message }
    },
    clearBanner() {
      this.banner = null
    },
    setLoading(value) {
      this.loading = value
    },
  },
})
