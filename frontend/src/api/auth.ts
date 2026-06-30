import request from './request'
import type { LoginResult, SystemConfig, UserInfo } from '../types/api'

export function login(data: { username: string; password: string }) {
  return request.post<any, { data: LoginResult }>('/auth/login', data)
}

export function register(data: {
  username: string
  email: string
  password: string
  nickname?: string
}) {
  return request.post<any, { data: LoginResult }>('/auth/register', data)
}

export function getMe() {
  return request.get<any, { data: UserInfo }>('/auth/me')
}

export function updateProfile(data: Partial<Pick<UserInfo, 'nickname' | 'email' | 'avatar'>>) {
  return request.put<any, { data: UserInfo }>('/auth/profile', data)
}

export function changePassword(data: { oldPassword: string; newPassword: string }) {
  return request.put('/auth/password', data)
}

export function getRegisterConfig() {
  return request.get<any, { data: { allowRegister: boolean } }>('/auth/register-config')
}

export function getPublicConfig() {
  return request.get<any, { data: Pick<SystemConfig, 'allowRegister'> }>('/config/public')
}
