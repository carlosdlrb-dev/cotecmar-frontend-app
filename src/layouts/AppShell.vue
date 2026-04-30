<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import SidebarNav from '../components/SidebarNav.vue'
import TopBar from '../components/TopBar.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const hideShell = computed(() => route.name === 'login')
const mobileMenuOpen = ref(false)

const handleLogout = async () => {
  await authStore.logout()
  router.replace({ name: 'login' })
}
</script>

<template>
  <div v-if="hideShell" class="min-h-screen">
    <slot />
  </div>
  <div v-else class="app-bg flex min-h-screen">
    <!-- Sidebar desktop -->
    <div class="hidden lg:block lg:fixed lg:inset-y-0 lg:left-0 lg:z-30">
      <SidebarNav />
    </div>

    <!-- Mobile sidebar overlay -->
    <Transition name="modal">
      <div
        v-if="mobileMenuOpen"
        class="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
        @click="mobileMenuOpen = false"
      >
        <div class="w-64 h-full" @click.stop>
          <SidebarNav />
        </div>
      </div>
    </Transition>

    <div class="flex flex-col flex-1 min-w-0 lg:pl-64">
      <TopBar @logout="handleLogout" @toggle-menu="mobileMenuOpen = !mobileMenuOpen" />
      <main class="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
        <slot />
      </main>
    </div>
  </div>
</template>
