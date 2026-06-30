import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getMe } from '../api/auth'
import { getToken, removeToken, setToken } from '../api/request'
import type { UserInfo } from '../types/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(getToken() || '')
  const user = ref<UserInfo | null>(null)

  async function fetchUser() {
    if (!token.value) return null
    const res = await getMe()
    user.value = res.data
    return user.value
  }

  function setAuth(newToken: string, userInfo: UserInfo) {
    token.value = newToken
    user.value = userInfo
    setToken(newToken)
  }

  function logout() {
    token.value = ''
    user.value = null
    removeToken()
  }

  function hasPermission(code: string) {
    if (!user.value?.role) return false
    if (user.value.role.code === 'admin') return true
    return user.value.role.permissions?.includes(code) ?? false
  }

  return { token, user, fetchUser, setAuth, logout, hasPermission }
})
