<template>
  <a-layout class="basic-layout">
    <!-- 侧边栏 -->
    <a-layout-sider
      v-model:collapsed="collapsed"
      :trigger="null"
      collapsible
      :width="200"
      :collapsed-width="80"
      class="layout-sider"
    >
      <!-- Logo -->
      <div class="logo">
        <img src="/favicon.svg" alt="Logo" class="logo-img" />
        <span v-show="!collapsed" class="logo-text">运维管理系统</span>
      </div>

      <!-- 菜单 -->
      <a-menu
        v-model:selectedKeys="selectedKeys"
        v-model:openKeys="openKeys"
        mode="inline"
        theme="dark"
        @click="handleMenuClick"
      >
        <template v-for="route in menuRoutes" :key="route.path">
          <!-- 有子菜单 -->
          <a-sub-menu v-if="route.children && route.children.length > 1" :key="route.path">
            <template #icon>
              <component :is="getIcon(route.meta?.icon)" />
            </template>
            <template #title>{{ route.meta?.title }}</template>
            <a-menu-item
              v-for="child in route.children.filter(c => !c.meta?.hidden)"
              :key="getFullPath(route.path, child.path)"
            >
              {{ child.meta?.title }}
            </a-menu-item>
          </a-sub-menu>

          <!-- 无子菜单或只有一个子菜单 -->
          <a-menu-item v-else :key="getMenuKey(route)">
            <template #icon>
              <component :is="getIcon(route.meta?.icon || route.children?.[0]?.meta?.icon)" />
            </template>
            <span>{{ route.meta?.title || route.children?.[0]?.meta?.title }}</span>
          </a-menu-item>
        </template>
      </a-menu>
    </a-layout-sider>

    <a-layout>
      <!-- 头部 -->
      <a-layout-header class="layout-header">
        <div class="header-left">
          <span class="trigger" @click="toggleCollapsed">
            <MenuUnfoldOutlined v-if="collapsed" />
            <MenuFoldOutlined v-else />
          </span>
          <a-breadcrumb class="breadcrumb">
            <a-breadcrumb-item v-for="item in breadcrumbs" :key="item.path || item.title">
              <router-link v-if="item.path" :to="item.path">{{ item.title }}</router-link>
              <span v-else>{{ item.title }}</span>
            </a-breadcrumb-item>
          </a-breadcrumb>
        </div>

        <div class="header-right">
          <a-dropdown>
            <div class="user-info">
              <a-avatar :size="32" style="background-color: #1890ff">
                {{ userStore.realName?.charAt(0) || 'U' }}
              </a-avatar>
              <span class="user-name">{{ userStore.realName }}</span>
            </div>
            <template #overlay>
              <a-menu>
                <a-menu-item key="profile">
                  <UserOutlined /> 个人信息
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="logout" @click="handleLogout">
                  <LogoutOutlined /> 退出登录
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </a-layout-header>

      <!-- 内容区 -->
      <a-layout-content class="layout-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  DesktopOutlined,
  AuditOutlined,
  ToolOutlined,
  UserOutlined,
  LogoutOutlined
} from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/modules/user'
import { asyncRoutes } from '@/router/routes'
import type { RouteRecordRaw } from 'vue-router'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 侧边栏折叠状态
const collapsed = ref(false)
const selectedKeys = ref<string[]>([])
const openKeys = ref<string[]>([])

// 面包屑
const breadcrumbs = computed(() => {
  const result: Array<{ title: string; path?: string }> = []
  const matched = route.matched.filter(item => item.meta?.title)
  matched.forEach(item => {
    result.push({
      title: item.meta?.title as string,
      path: item.path
    })
  })
  return result
})

// 根据角色过滤菜单
const menuRoutes = computed(() => {
  const roles = userStore.roles
  return filterRoutesByRoles(asyncRoutes, roles)
})

function filterRoutesByRoles(routes: RouteRecordRaw[], roles: string[]): RouteRecordRaw[] {
  return routes.filter(route => {
    const routeRoles = route.meta?.roles as string[] | undefined
    if (routeRoles && routeRoles.length > 0) {
      const hasRole = roles.some(role => routeRoles.includes(role))
      if (!hasRole) return false
    }
    return true
  })
}

// 获取图标组件
function getIcon(iconName?: string) {
  const iconMap: Record<string, any> = {
    'DashboardOutlined': DashboardOutlined,
    'DesktopOutlined': DesktopOutlined,
    'AuditOutlined': AuditOutlined,
    'ToolOutlined': ToolOutlined
  }
  return iconName ? iconMap[iconName] || DashboardOutlined : DashboardOutlined
}

// 获取菜单key
function getMenuKey(route: RouteRecordRaw): string {
  if (route.children && route.children.length === 1) {
    const child = route.children[0]
    return getFullPath(route.path, child.path)
  }
  return route.redirect as string || route.path
}

// 获取完整路径
function getFullPath(parentPath: string, childPath: string): string {
  if (childPath.startsWith('/')) {
    return childPath
  }
  return `${parentPath}/${childPath}`.replace(/\/+/g, '/')
}

// 切换折叠
function toggleCollapsed() {
  collapsed.value = !collapsed.value
}

// 菜单点击
function handleMenuClick({ key }: { key: string }) {
  router.push(key)
}

// 退出登录
function handleLogout() {
  userStore.logout()
}

// 监听路由变化，更新选中状态
watch(
  () => route.path,
  (path) => {
    selectedKeys.value = [path]
    // 设置展开的菜单
    const parentPath = '/' + path.split('/')[1]
    if (parentPath && parentPath !== '/') {
      openKeys.value = [parentPath]
    }
  },
  { immediate: true }
)
</script>

<style lang="less" scoped>
.basic-layout {
  height: 100vh;
}

.layout-sider {
  background: #001529;

  .logo {
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.1);

    .logo-img {
      width: 32px;
      height: 32px;
    }

    .logo-text {
      color: #fff;
      font-size: 16px;
      font-weight: 600;
      white-space: nowrap;
    }
  }
}

.layout-header {
  background: #fff;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;

    .trigger {
      font-size: 18px;
      cursor: pointer;
      transition: color 0.3s;

      &:hover {
        color: @primary-color;
      }
    }

    .breadcrumb {
      :deep(.ant-breadcrumb) {
        font-size: 14px;
      }
    }
  }

  .header-right {
    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;

      .user-name {
        color: @text-color;
      }
    }
  }
}

.layout-content {
  margin: 16px;
  padding: 16px;
  background: #fff;
  border-radius: 4px;
  overflow: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>