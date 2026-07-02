import request from './request'
import type { OperationLogItem, PageResult } from '../types/api'

export function getOperationLogs(params: {
  keyword?: string
  module?: string
  action?: string
  status?: string
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}) {
  return request.get<any, { data: PageResult<OperationLogItem> }>('/logs', { params })
}
