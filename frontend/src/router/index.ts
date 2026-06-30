import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '../layouts/AdminLayout.vue'
import { getToken } from '../api/request'
import { useAuthStore } from '../stores/auth'
import { usePermissionStore } from '../stores/permission'

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
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('../views/error/404.vue'),
      meta: { title: '页面不存在', public: true },
    },
  ],
})

let routeReady = false

export async function setupDynamicRoutes() {
  const permissionStore = usePermissionStore()
  if (permissionStore.routesAdded) return

  await permissionStore.loadMenus()
  const dynamicRoutes = await permissionStore.generateRoutes()

  for (const route of dynamicRoutes) {
    router.addRoute('Layout', route)
  }

  permissionStore.routesAdded = true
  routeReady = true
}

router.beforeEach(async (to, _from, next) => {
  document.title = `${to.meta.title || '后台管理系统'}`

  if (to.meta.public) {
    if (to.path === '/login' && getToken()) {
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
