import {
  DataAnalysis,
  Setting,
  User,
} from '@element-plus/icons-vue'
import type { MenuItem } from '../types/menu'

export const menuItems: MenuItem[] = [
  {
    path: '/dashboard',
    title: '仪表盘',
    icon: DataAnalysis,
  },
  {
    path: '/users',
    title: '用户管理',
    icon: User,
  },
  {
    path: '/settings',
    title: '系统设置',
    icon: Setting,
  },
]
