export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

export interface UserInfo {
  id: string
  username: string
  email: string
  nickname: string
  avatar: string
  status: 'active' | 'disabled'
  lastLoginAt?: string
  role: {
    id: string
    name: string
    code: string
    permissions?: string[]
  } | null
}

export interface LoginResult {
  token: string
  user: UserInfo
}

export interface MenuNode {
  id: string
  title: string
  path: string
  name: string
  component: string
  icon: string
  parentId: string | null
  sort: number
  hidden: boolean
  permission: string
  type: 'menu' | 'button'
  children?: MenuNode[]
}

export interface RoleItem {
  id: string
  name: string
  code: string
  description: string
  permissions: string[]
  isSystem: boolean
  createdAt: string
}

export interface UserItem {
  id: string
  username: string
  email: string
  nickname: string
  avatar: string
  status: 'active' | 'disabled'
  lastLoginAt?: string
  role: { id: string; name: string; code: string } | null
  createdAt: string
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export interface DashboardStats {
  userCount: number
  roleCount: number
  menuCount: number
  activeUsers: number
  todayVisits: number
}

export interface SystemConfig {
  siteName: string
  adminEmail: string
  enableNotify: boolean
  allowRegister: boolean
}
