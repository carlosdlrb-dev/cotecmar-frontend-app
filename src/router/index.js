import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useUiStore } from '../stores/ui'

import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import ProjectsView from '../views/ProjectsView.vue'
import ProjectBlocksView from '../views/ProjectBlocksView.vue'
import BlocksView from '../views/BlocksView.vue'
import PiecesView from '../views/PiecesView.vue'
import ReportsView from '../views/ReportsView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { public: true, title: 'Iniciar sesión' },
    },
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { title: 'Dashboard' },
    },
    {
      path: '/proyectos',
      name: 'projects',
      component: ProjectsView,
      meta: { title: 'Proyectos' },
    },
    {
      path: '/proyectos/:id/bloques',
      name: 'project-blocks',
      component: ProjectBlocksView,
      props: true,
      meta: { title: 'Bloques' },
    },
    {
      path: '/bloques',
      name: 'blocks',
      component: BlocksView,
      meta: { title: 'Bloques' },
    },
    {
      path: '/piezas',
      name: 'pieces',
      component: PiecesView,
      meta: { title: 'Piezas' },
    },
    {
      path: '/reportes',
      name: 'reports',
      component: ReportsView,
      meta: { title: 'Reportes' },
    },
  ],
})

router.beforeEach((to) => {
  const authStore = useAuthStore()
  const uiStore = useUiStore()

  if (to.meta.public) {
    if (authStore.isAuthenticated && to.name === 'login') {
      return { name: 'dashboard' }
    }
    return true
  }

  if (!authStore.isAuthenticated) {
    uiStore.showToast({
      type: 'warning',
      title: 'Acceso requerido',
      message: 'Debes iniciar sesión para entrar a esa ruta.',
    })
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  return true
})

export default router
