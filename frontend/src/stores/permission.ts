import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import { getUserMenus, getUserRoutes } from '../api/menu'
import type { MenuNode } from '../types/api'
import { resolveIcon } from '../utils/icons'

const viewModules = import.meta.glob('../views/**/*.vue')

function loadView(component: string) {
  const key = `../views/${component}`
  const loader = viewModules[key]
  if (!loader) {
    return () => import('../views/dashboard/index.vue')
  }
  return loader
}

function flattenMenus(menus: MenuNode[]): MenuNode[] {
  const result: MenuNode[] = []
  for (const menu of menus) {
    result.push(menu)
    if (menu.children?.length) {
      result.push(...flattenMenus(menu.children))
    }
  }
  return result
}

export const usePermissionStore = defineStore('permission', () => {
  const menus = ref<MenuNode[]>([])
  const routesAdded = ref(false)
  const addedRouteNames = ref<string[]>([])

  async function loadMenus() {
    const res = await getUserMenus()
    menus.value = res.data
    return menus.value
  }

  async function generateRoutes(): Promise<RouteRecordRaw[]> {
    const res = await getUserRoutes()
    const flatMenus = flattenMenus(res.data)

    const routes = flatMenus
      .filter((menu) => menu.component)
      .map((menu) => ({
        path: menu.path.replace(/^\//, ''),
        name: menu.name,
        component: loadView(menu.component),
        meta: {
          title: menu.title,
          permission: menu.permission,
          icon: menu.icon,
        },
      }))

    addedRouteNames.value = routes.map((route) => route.name as string)
    return routes
  }

  function getSidebarMenus() {
    return menus.value
      .filter((item) => !item.hidden)
      .map((item) => ({
        ...item,
        icon: resolveIcon(item.icon),
        children: item.children
          ?.filter((child) => !child.hidden)
          .map((child) => ({
            ...child,
            icon: resolveIcon(child.icon),
          })),
      }))
  }

  function resetRoutes(router: { hasRoute: (name: string) => boolean; removeRoute: (name: string) => void }) {
    for (const name of addedRouteNames.value) {
      if (router.hasRoute(name)) {
        router.removeRoute(name)
      }
    }
    if (router.hasRoute('NotFound')) {
      router.removeRoute('NotFound')
    }
    addedRouteNames.value = []
    routesAdded.value = false
  }

  function reset(router?: { hasRoute: (name: string) => boolean; removeRoute: (name: string) => void }) {
    menus.value = []
    if (router) {
      resetRoutes(router)
    } else {
      routesAdded.value = false
      addedRouteNames.value = []
    }
  }

  return { menus, routesAdded, loadMenus, generateRoutes, getSidebarMenus, reset, resetRoutes }
})
