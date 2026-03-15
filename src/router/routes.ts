import type { RouteRecordRaw } from 'vue-router'
import { RoleEnum } from '@/types/api.d.ts'

// 静态路由（无需权限）
export const publicRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: {
      title: '登录'
    }
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/error/403.vue'),
    meta: {
      title: '无权限'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: {
      title: '页面不存在'
    }
  }
]

// 需要权限的路由
export const asyncRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/BasicLayout/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: {
          title: '仪表盘',
          icon: 'DashboardOutlined',
          roles: [RoleEnum.ADMIN, RoleEnum.INSPECTOR, RoleEnum.REPAIRMAN]
        }
      }
    ]
  },
  {
    path: '/device',
    component: () => import('@/layouts/BasicLayout/index.vue'),
    redirect: '/device/list',
    meta: {
      title: '设备管理',
      icon: 'DesktopOutlined',
      roles: [RoleEnum.ADMIN]
    },
    children: [
      {
        path: 'list',
        name: 'DeviceList',
        component: () => import('@/views/device/DeviceList/index.vue'),
        meta: {
          title: '设备列表',
          roles: [RoleEnum.ADMIN]
        }
      },
      {
        path: 'detail/:id',
        name: 'DeviceDetail',
        component: () => import('@/views/device/DeviceDetail/index.vue'),
        meta: {
          title: '设备详情',
          hidden: true,
          roles: [RoleEnum.ADMIN]
        }
      }
    ]
  },
  {
    path: '/inspection',
    component: () => import('@/layouts/BasicLayout/index.vue'),
    redirect: '/inspection/task',
    meta: {
      title: '巡检管理',
      icon: 'AuditOutlined',
      roles: [RoleEnum.ADMIN, RoleEnum.INSPECTOR]
    },
    children: [
      {
        path: 'task',
        name: 'InspectionTask',
        component: () => import('@/views/inspection/TaskList/index.vue'),
        meta: {
          title: '巡检任务',
          roles: [RoleEnum.ADMIN, RoleEnum.INSPECTOR]
        }
      },
      {
        path: 'record',
        name: 'InspectionRecord',
        component: () => import('@/views/inspection/RecordList/index.vue'),
        meta: {
          title: '巡检记录',
          roles: [RoleEnum.ADMIN, RoleEnum.INSPECTOR]
        }
      }
    ]
  },
  {
    path: '/work-order',
    component: () => import('@/layouts/BasicLayout/index.vue'),
    redirect: '/work-order/list',
    meta: {
      title: '工单管理',
      icon: 'ToolOutlined',
      roles: [RoleEnum.ADMIN, RoleEnum.REPAIRMAN]
    },
    children: [
      {
        path: 'list',
        name: 'WorkOrderList',
        component: () => import('@/views/work-order/List/index.vue'),
        meta: {
          title: '工单列表',
          roles: [RoleEnum.ADMIN, RoleEnum.REPAIRMAN]
        }
      },
      {
        path: 'detail/:id',
        name: 'WorkOrderDetail',
        component: () => import('@/views/work-order/Detail/index.vue'),
        meta: {
          title: '工单详情',
          hidden: true,
          roles: [RoleEnum.ADMIN, RoleEnum.REPAIRMAN]
        }
      }
    ]
  }
]