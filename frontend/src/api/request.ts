import axios from 'axios'
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import router from '../router'
import type { ApiResponse } from '../types/api'

const TOKEN_KEY = 'admin_token'

const request = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

request.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data
    if (res.code !== 0) {
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message))
    }
    return res as unknown as AxiosResponse<ApiResponse>
  },
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message || error.message || '网络错误'
    const url = error.config?.url || ''
    const isAuthRequest = /\/auth\/(login|register)$/.test(url)

    if (status === 401 && !isAuthRequest) {
      localStorage.removeItem(TOKEN_KEY)
      if (router.currentRoute.value.path !== '/login') {
        router.push({ path: '/login', query: { redirect: router.currentRoute.value.fullPath } })
      }
    }

    ElMessage.error(message)
    return Promise.reject(error)
  }
)

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export default request
