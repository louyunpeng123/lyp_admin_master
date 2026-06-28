import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '../layouts/AdminLayout.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: AdminLayout,
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('../views/dashboard/index.vue'),
          meta: { title: '仪表盘' },
        },
        {
          path: 'users',
          name: 'Users',
          component: () => import('../views/user/index.vue'),
          meta: { title: '用户管理' },
        },
        {
          path: 'settings',
          name: 'Settings',
          component: () => import('../views/settings/index.vue'),
          meta: { title: '系统设置' },
        },
      ],
    },
  ],
})

export default router
