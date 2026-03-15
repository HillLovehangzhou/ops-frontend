import { request } from '@/utils/request'
import type { User } from '@/types/api.d.ts'

// 登录
export function login(data: { username: string; password: string }): Promise<{
  token: string
  id: number
  username: string
  realName: string
  role: string
}> {
  return request.post('/auth/login', data)
}

// 获取当前用户信息
export function getUserInfo(): Promise<User> {
  return request.get('/auth/info')
}

// 登出
export function logout(): Promise<void> {
  return request.post('/auth/logout')
}
