import request from './request'
import type { MenuNode } from '../types/api'

export function getUserMenus() {
  return request.get<any, { data: MenuNode[] }>('/menus/user')
}

export function getUserRoutes() {
  return request.get<any, { data: MenuNode[] }>('/menus/routes')
}

export function getMenus() {
  return request.get<any, { data: MenuNode[] }>('/menus')
}

export function createMenu(data: Partial<MenuNode>) {
  return request.post<any, { data: MenuNode }>('/menus', data)
}

export function updateMenu(id: string, data: Partial<MenuNode>) {
  return request.put<any, { data: MenuNode }>(`/menus/${id}`, data)
}

export function deleteMenu(id: string) {
  return request.delete(`/menus/${id}`)
}
