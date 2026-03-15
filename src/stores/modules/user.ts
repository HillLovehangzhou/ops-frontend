import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getToken, setToken, removeToken, getStoredUser, setStoredUser, removeStoredUser } from '@/utils/storage'
import { login as loginApi, getUserInfo as getUserInfoApi, logout as logoutApi } from '@/api'
import type { User } from '@/types/api.d.ts'
import router from '@/router'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref<string>(getToken() || '')
  const storedUser = getStoredUser()
  // 确保从 localStorage 读取的角色格式统一
  if (storedUser?.role && !storedUser.role.startsWith('ROLE_')) {
    storedUser.role = `ROLE_${storedUser.role}`
  }
  if (storedUser?.roles) {
    storedUser.roles = storedUser.roles.map((r: string) => r.startsWith('ROLE_') ? r : `ROLE_${r}`)
  }
  const userInfo = ref<User | null>(storedUser)
  const roles = ref<string[]>(userInfo.value?.role ? [userInfo.value.role] : (userInfo.value?.roles || []))

  // 计算属性
  const isLoggedIn = computed(() => !!token.value)
  const username = computed(() => userInfo.value?.username || '')
  const realName = computed(() => userInfo.value?.realName || '')

  // 登录
  async function login(params: { username: string; password: string }) {
    const result = await loginApi(params)
    token.value = result.token

    // 后端返回的角色格式是 ADMIN/INSPECTOR/REPAIRMAN，需要转换为 ROLE_ADMIN 等格式
    const roleWithPrefix = result.role.startsWith('ROLE_') ? result.role : `ROLE_${result.role}`

    const user: User = {
      id: result.id,
      username: result.username,
      realName: result.realName,
      role: roleWithPrefix as any,
      roles: [roleWithPrefix]
    }

    userInfo.value = user
    roles.value = [roleWithPrefix]
    setToken(result.token)
    setStoredUser(user)
    return result
  }

  // 登出
  async function logout() {
    try {
      await logoutApi()
    } catch (e) {
      // ignore
    }
    token.value = ''
    userInfo.value = null
    roles.value = []
    removeToken()
    removeStoredUser()
    router.push('/login')
  }

  // 获取用户信息
  async function getUserInfo(): Promise<User> {
    const user = await getUserInfoApi()
    // 确保角色格式统一为 ROLE_xxx
    if (user.role && !user.role.startsWith('ROLE_')) {
      user.role = `ROLE_${user.role}` as any
    }
    if (user.roles) {
      user.roles = user.roles.map(r => r.startsWith('ROLE_') ? r : `ROLE_${r}`)
    }
    userInfo.value = user
    roles.value = user.role ? [user.role] : (user.roles || [])
    setStoredUser(user)
    return user
  }

  // 检查是否有某个角色
  function hasRole(role: string): boolean {
    return roles.value.includes(role)
  }

  // 检查是否有任意一个角色
  function hasAnyRole(roleList: string[]): boolean {
    return roleList.some(role => roles.value.includes(role))
  }

  return {
    token,
    userInfo,
    roles,
    isLoggedIn,
    username,
    realName,
    login,
    logout,
    getUserInfo,
    hasRole,
    hasAnyRole
  }
})
