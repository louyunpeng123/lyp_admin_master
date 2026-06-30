import request from './request'
import type { RoleItem } from '../types/api'

export function getRoles() {
  return request.get<any, { data: RoleItem[] }>('/roles')
}

export function getPermissions() {
  return request.get<any, { data: string[] }>('/roles/permissions')
}

export function createRole(data: {
  name: string
  code: string
  description?: string
  permissions: string[]
}) {
  return request.post<any, { data: RoleItem }>('/roles', data)
}

export function updateRole(
  id: string,
  data: Partial<{ name: string; description: string; permissions: string[] }>
) {
  return request.put<any, { data: RoleItem }>(`/roles/${id}`, data)
}

export function deleteRole(id: string) {
  return request.delete(`/roles/${id}`)
}
