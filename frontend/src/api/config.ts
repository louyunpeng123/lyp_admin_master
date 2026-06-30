import request from './request'
import type { DashboardStats, SystemConfig } from '../types/api'

export function getDashboardStats() {
  return request.get<any, { data: DashboardStats }>('/dashboard/stats')
}

export function getConfig() {
  return request.get<any, { data: SystemConfig }>('/config')
}

export function updateConfig(data: Partial<SystemConfig>) {
  return request.put<any, { data: SystemConfig }>('/config', data)
}
