import request from './request'
import type { PageResult, UserItem } from '../types/api'

export function getUsers(params: { keyword?: string; page?: number; pageSize?: number }) {
  return request.get<any, { data: PageResult<UserItem> }>('/users', { params })
}

export function createUser(data: {
  username: string
  email: string
  password: string
  nickname?: string
  roleId: string
  status?: string
}) {
  return request.post<any, { data: UserItem }>('/users', data)
}

export function updateUser(
  id: string,
  data: Partial<{ nickname: string; email: string; roleId: string; status: string; password: string }>
) {
  return request.put<any, { data: UserItem }>(`/users/${id}`, data)
}

export function deleteUser(id: string) {
  return request.delete(`/users/${id}`)
}

export function toggleUserStatus(id: string, status: 'active' | 'disabled') {
  return request.patch<any, { data: UserItem }>(`/users/${id}/status`, { status })
}
