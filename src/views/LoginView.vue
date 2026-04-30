<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authApi } from '../api/client'
import { useAuthStore } from '../stores/auth'
import { useUiStore } from '../stores/ui'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const uiStore = useUiStore()

const form = reactive({ email: 'demo@example.com', password: 'secret123' })
const errors = reactive({ email: '', password: '', general: '' })
const submitting = ref(false)
const showPassword = ref(false)

const clearErrors = () => { errors.email = ''; errors.password = ''; errors.general = '' }

const handleLogin = async () => {
  clearErrors()
  if (!form.email)    errors.email = 'El correo es obligatorio.'
  if (!form.password) errors.password = 'La contraseña es obligatoria.'
  if (errors.email || errors.password) return

  try {
    submitting.value = true
    const { data } = await authApi.post('/login', { email: form.email, password: form.password })
    authStore.setSession({ token: data.token, user: data.user, expires_in: data.expires_in ?? 3600 })
    uiStore.showToast({ type: 'success', title: 'Bienvenido', message: `Hola, ${data.user?.name || 'usuario'}.` })
    router.replace(String(route.query.redirect || '/dashboard'))
  } catch (error) {
    const status = error?.response?.status
    if (status === 401) {
      errors.general = 'Credenciales inválidas. Verifica tu correo y contraseña.'
    } else if (status === 422) {
      const fields = error?.response?.data?.errors || {}
      errors.email    = fields.email?.[0] || ''
      errors.password = fields.password?.[0] || ''
      errors.general  = error?.response?.data?.message || 'Revisa los datos enviados.'
    } else {
      errors.general = 'No pudimos conectar con el servidor. Intenta nuevamente.'
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen grid lg:grid-cols-2">
    <div class="hidden lg:flex flex-col relative overflow-hidden bg-[#071f2a]">
      <div class="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#0a2533] to-[#071f2a]"></div>
      <div class="absolute -top-40 -left-20 w-[600px] h-[600px] rounded-full bg-brand-600/25 blur-[150px] pointer-events-none animate-float"></div>
      <div class="absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full bg-brand-400/15 blur-[120px] pointer-events-none animate-float-delayed"></div>
      <div class="absolute -bottom-20 left-1/4 w-[400px] h-[400px] rounded-full bg-brand-500/10 blur-[100px] pointer-events-none animate-float-slow"></div>
      <div class="absolute inset-0 bg-dot-pattern bg-dot opacity-60 pointer-events-none"></div>
      <div class="floating-particle w-2 h-2 top-1/4 left-1/4" style="animation-delay: 0s;"></div>
      <div class="floating-particle w-3 h-3 top-1/3 right-1/3" style="animation-delay: 1s;"></div>
      <div class="floating-particle w-2 h-2 bottom-1/3 left-1/3" style="animation-delay: 2s;"></div>
      <div class="floating-particle w-4 h-4 top-2/3 right-1/4" style="animation-delay: 3s;"></div>
      <div class="floating-particle w-2 h-2 bottom-1/4 left-2/3" style="animation-delay: 4s;"></div>
      <div class="absolute inset-0 bg-mesh opacity-30 pointer-events-none"></div>

      <div class="relative flex flex-col justify-center h-full px-14 py-16 max-w-[560px] mx-auto w-full">
        <div class="flex items-center gap-3 mb-16 animate-fade-up">
          <div class="w-11 h-11 rounded-2xl bg-brand-500/20 border border-brand-400/40 flex items-center justify-center text-brand-400 flex-shrink-0 shadow-glow animate-pulse-glow">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
          </div>
          <div>
            <p class="text-white font-bold text-lg leading-tight">Pieces Control</p>
            <p class="text-white/35 text-sm">Cotecmar</p>
          </div>
        </div>

        <h2 class="text-[42px] font-black text-white leading-[1.15] tracking-tight mb-5 animate-fade-up stagger-1">
          Control total de<br /><span class="gradient-text">fabricación naval</span>
        </h2>
        <p class="text-white/55 text-[15px] leading-relaxed mb-14 max-w-[360px] animate-fade-up stagger-2">
          Gestiona proyectos, bloques y piezas en tiempo real.
          Controla pesos, estados y reportes desde un solo panel.
        </p>

        <div class="login-visual-grid">
          <div class="login-stat-card group cursor-default">
            <span class="text-white counter-animate">24</span>
            <span class="text-white/55 group-hover:text-brand-300">Proyectos<br/>activos</span>
            <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-brand-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          <div class="login-stat-card group cursor-default">
            <span class="text-white counter-animate">186</span>
            <span class="text-white/55 group-hover:text-brand-300">Piezas<br/>en curso</span>
            <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-brand-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          <div class="login-stat-card group cursor-default">
            <span class="text-brand-400 counter-animate">98%</span>
            <span class="text-white/55 group-hover:text-brand-300">Control<br/>calidad</span>
            <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-brand-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        </div>

        <div class="mt-12 h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent animate-pulse"></div>
      </div>
    </div>

    <div class="login-shell">
      <div class="absolute top-0 right-0 w-96 h-96 bg-brand-100/30 rounded-full blur-3xl pointer-events-none animate-float-slow"></div>
      <div class="absolute bottom-0 left-0 w-64 h-64 bg-brand-50/50 rounded-full blur-2xl pointer-events-none animate-float"></div>

      <div class="login-panel">
        <div class="mb-8">
          <div class="flex items-center gap-2 mb-4">
            <span class="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
            <p class="text-brand-600 text-[11px] font-bold uppercase tracking-[0.22em]">
              Microservicios · Auth Service
            </p>
          </div>
          <h1 class="text-[32px] font-black text-slate-900 mb-2 tracking-tight">Acceso seguro</h1>
          <p class="text-slate-500 text-sm">Autentícate para gestionar proyectos, bloques y piezas.</p>
        </div>

        <form class="space-y-5" @submit.prevent="handleLogin">
          <div class="space-y-1">
            <label class="block text-[13px] font-semibold text-slate-700">Correo electrónico</label>
            <input
              v-model.trim="form.email"
              type="email"
              placeholder="demo@example.com"
              autocomplete="email"
              class="w-full h-11 px-4 rounded-xl border text-sm text-slate-800 placeholder-slate-400 transition-all focus:outline-none focus:ring-2"
              :class="errors.email
                ? 'border-red-400 focus:ring-red-400/20 focus:border-red-400'
                : 'border-slate-200 focus:ring-brand-500/20 focus:border-brand-500'"
            />
            <p v-if="errors.email" class="text-xs text-red-500">{{ errors.email }}</p>
          </div>

          <div class="space-y-1">
            <label class="block text-[13px] font-semibold text-slate-700">Contraseña</label>
            <div class="relative">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                autocomplete="current-password"
                class="w-full h-11 px-4 pr-11 rounded-xl border text-sm text-slate-800 placeholder-slate-400 transition-all focus:outline-none focus:ring-2"
                :class="errors.password
                  ? 'border-red-400 focus:ring-red-400/20 focus:border-red-400'
                  : 'border-slate-200 focus:ring-brand-500/20 focus:border-brand-500'"
              />
              <button
                type="button"
                tabindex="-1"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                @click="showPassword = !showPassword"
              >
                <svg v-if="!showPassword" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>
            <p v-if="errors.password" class="text-xs text-red-500">{{ errors.password }}</p>
          </div>

          <Transition name="form-error">
            <div v-if="errors.general" class="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              <svg class="flex-shrink-0" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {{ errors.general }}
            </div>
          </Transition>

          <button
            type="submit"
            :disabled="submitting"
            class="w-full h-12 flex items-center justify-center gap-2.5 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white font-bold rounded-xl text-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none shimmer-btn group relative overflow-hidden"
          >
            <span v-if="submitting" class="spinner relative z-10"></span>
            <span class="relative z-10">{{ submitting ? 'Ingresando...' : 'Iniciar sesión' }}</span>
            <svg v-if="!submitting" class="w-4 h-4 relative z-10 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          </button>
        </form>

        <div class="mt-6 p-4 bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-2xl hover-lift cursor-pointer group" @click="form.email='demo@example.com'; form.password='secret123'">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center text-brand-600 group-hover:scale-110 transition-transform">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
              </svg>
            </div>
            <div>
              <p class="text-[11px] font-semibold text-slate-600 uppercase tracking-wide">Demo credentials</p>
              <p class="text-[12px] text-slate-500 font-mono">demo@example.com / secret123</p>
            </div>
            <div class="ml-auto text-[10px] text-brand-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Click para autocompletar →
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
