<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import { useUiStore } from './stores/ui'
import AppShell from './layouts/AppShell.vue'
import ConfirmationModal from './components/ConfirmationModal.vue'

const authStore = useAuthStore()
const uiStore = useUiStore()

onMounted(() => {
  authStore.initAuth()
})
</script>

<template>
  <AppShell>
    <RouterView v-slot="{ Component, route }">
      <Transition name="page" mode="out-in">
        <component :is="Component" :key="route.path" />
      </Transition>
    </RouterView>
  </AppShell>

  <!-- Banner -->
  <Transition name="banner">
    <div v-if="uiStore.banner" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] max-w-xl w-[calc(100vw-40px)]">
      <div
        class="rounded-2xl shadow-modal border"
        :class="{
          'bg-red-50 border-red-200': uiStore.banner.type === 'error',
          'bg-amber-50 border-amber-200': uiStore.banner.type === 'warning',
          'bg-white border-slate-200': !uiStore.banner.type || uiStore.banner.type === 'info',
        }"
      >
        <div class="flex items-center gap-4 px-5 py-4">
          <div class="flex-1 min-w-0">
            <p class="text-sm font-bold text-slate-800">{{ uiStore.banner.title }}</p>
            <p class="text-xs text-slate-500 mt-0.5">{{ uiStore.banner.message }}</p>
          </div>
          <button
            class="flex-shrink-0 px-4 py-1.5 rounded-full border border-slate-200 bg-white text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-all"
            type="button"
            @click="uiStore.clearBanner()"
          >
            <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6L6 18"/>
              <path d="M6 6l12 12"/>
            </svg>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Toast stack -->
  <TransitionGroup name="toast" tag="div" class="fixed top-4 right-4 flex flex-col gap-2.5 z-[100] pointer-events-none">
    <div
      v-for="toast in uiStore.toasts"
      :key="toast.id"
      class="pointer-events-auto bg-white rounded-xl shadow-modal border border-slate-100 min-w-[260px] max-w-[340px] flex overflow-hidden"
    >
      <div
        class="w-1 flex-shrink-0"
        :class="{
          'bg-brand-500': !toast.type || toast.type === 'info',
          'bg-emerald-500': toast.type === 'success',
          'bg-amber-500': toast.type === 'warning',
          'bg-red-500': toast.type === 'error',
        }"
      ></div>
      <div class="flex-1 px-4 py-3 min-w-0">
        <p class="text-[13px] font-bold text-slate-800">{{ toast.title }}</p>
        <p v-if="toast.message" class="text-xs text-slate-500 mt-0.5">{{ toast.message }}</p>
      </div>
      <button
        class="px-3 text-slate-400 hover:text-slate-700 transition-colors text-xl leading-none"
        type="button"
        @click="uiStore.removeToast(toast.id)"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 6L6 18"/>
          <path d="M6 6l12 12"/>
        </svg>
      </button>
    </div>
  </TransitionGroup>

  <!-- Confirmation Modal -->
  <ConfirmationModal />
</template>
