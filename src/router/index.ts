import { createRouter, createWebHistory } from 'vue-router'
import { publicRoutes, asyncRoutes } from './routes'
import { useUserStore } from '@/stores/modules/user'
import type { RouteRecordRaw } from 'vue-router'

/** 各模块入口路径及其所需角色（与 routes 一致，用于 403 页“返回首页”跳转到有权限的页面） */
const ENTRY_PATHS_WITH_ROLES: { path: string; roles: string[] }[] = [
  { path: '/dashboard', roles: ['ROLE_ADMIN', 'ROLE_INSPECTOR', 'ROLE_REPAIRMAN'] },
  { path: '/device/list', roles: ['ROLE_ADMIN'] },
  { path: '/inspection/task', roles: ['ROLE_ADMIN', 'ROLE_INSPECTOR'] },
  { path: '/work-order/list', roles: ['ROLE_ADMIN', 'ROLE_REPAIRMAN'] }
]

/** 获取当前用户有权限访问的第一个入口路径，用于无权限页“返回首页”；无任何权限时返回登录页 */
export function getFirstAllowedPath(userRoles: string[]): string {
  if (!userRoles || userRoles.length === 0) return '/login'
  for (const { path, roles } of ENTRY_PATHS_WITH_ROLES) {
    if (userRoles.some((r) => roles.includes(r))) return path
  }
  return '/login'
}

const router = createRouter({
  history: createWebHistory(),
  routes: [...publicRoutes, ...asyncRoutes],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})

// 白名单路由
const whiteList = ['/login', '/403', '/404']

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  const title = to.meta?.title as string
  if (title) {
    document.title = `${title} - 运维管理系统`
  }

  const userStore = useUserStore()
  const token = userStore.token

  if (token) {
    // 已登录
    if (to.path === '/login') {
      // 已登录访问登录页，重定向到有权限的首页
      const firstAllowed = getFirstAllowedPath(userStore.roles)
      if (firstAllowed === '/login') {
        // 没有任何权限，允许访问登录页（可能是角色数据问题）
        next()
      } else {
        next({ path: firstAllowed })
      }
    } else {
      // 检查权限
      const roles = to.meta?.roles as string[] | undefined
      if (roles && roles.length > 0) {
        const hasRole = userStore.hasAnyRole(roles)
        if (hasRole) {
          next()
        } else {
          next({ path: '/403' })
        }
      } else {
        next()
      }
    }
  } else {
    // 未登录
    if (whiteList.includes(to.path)) {
      // 白名单路由，直接访问
      next()
    } else {
      // 其他路由，重定向到登录页
      next({ path: '/login', query: { redirect: to.fullPath } })
    }
  }
})

export default router

// 根据角色过滤路由
export function filterAsyncRoutes(routes: RouteRecordRaw[], roles: string[]): RouteRecordRaw[] {
  const result: RouteRecordRaw[] = []

  routes.forEach(route => {
    const tmp = { ...route }
    const routeRoles = tmp.meta?.roles as string[] | undefined

    if (routeRoles && routeRoles.length > 0) {
      const hasRole = roles.some(role => routeRoles.includes(role))
      if (hasRole) {
        if (tmp.children) {
          tmp.children = filterAsyncRoutes(tmp.children, roles)
        }
        result.push(tmp)
      }
    } else {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      result.push(tmp)
    }
  })

  return result
}