// 本地存储工具

const TOKEN_KEY = 'ops_token'
const USER_KEY = 'ops_user'

// Token 操作
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

// 用户信息操作
export function getStoredUser(): any {
  const user = localStorage.getItem(USER_KEY)
  return user ? JSON.parse(user) : null
}

export function setStoredUser(user: any): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function removeStoredUser(): void {
  localStorage.removeItem(USER_KEY)
}

// 清除所有登录信息
export function clearAuth(): void {
  removeToken()
  removeStoredUser()
}