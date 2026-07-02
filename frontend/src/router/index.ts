import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '../layouts/AdminLayout.vue'
import { getToken } from '../api/request'
import { useAuthStore } from '../stores/auth'
import { usePermissionStore } from '../stores/permission'

export const NOT_FOUND_ROUTE_NAME = 'NotFound'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/login/index.vue'),
      meta: { title: '登录', public: true },
    },
    {
      path: '/',
      name: 'Layout',
      component: AdminLayout,
      redirect: '/dashboard',
      children: [],
    },
  ],
})

let routeReady = false

function addNotFoundRoute() {
  if (router.hasRoute(NOT_FOUND_ROUTE_NAME)) return

  router.addRoute({
    path: '/:pathMatch(.*)*',
    name: NOT_FOUND_ROUTE_NAME,
    component: () => import('../views/error/404.vue'),
    meta: { title: '页面不存在' },
  })
}

export async function setupDynamicRoutes() {
  const permissionStore = usePermissionStore()
  if (permissionStore.routesAdded) return

  await permissionStore.loadMenus()
  const dynamicRoutes = await permissionStore.generateRoutes()

  for (const route of dynamicRoutes) {
    router.addRoute('Layout', route)
  }

  addNotFoundRoute()
  permissionStore.routesAdded = true
  routeReady = true
}

router.beforeEach(async (to, _from, next) => {
  document.title = `${to.meta.title || '后台管理系统'}`

  if (to.path === '/login') {
    if (getToken()) {
      next('/dashboard')
      return
    }
    next()
    return
  }

  const token = getToken()
  if (!token) {
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }

  const authStore = useAuthStore()
  const permissionStore = usePermissionStore()

  try {
    if (!authStore.user) {
      await authStore.fetchUser()
    }
    if (!routeReady || !permissionStore.routesAdded) {
      await setupDynamicRoutes()
      next({ ...to, replace: true })
      return
    }
    next()
  } catch {
    authStore.logout()
    permissionStore.reset(router)
    routeReady = false
    next({ path: '/login', query: { redirect: to.fullPath } })
  }
})

export default router
