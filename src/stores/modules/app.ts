import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 侧边栏折叠状态
  const sidebarCollapsed = ref(false)

  // 加载状态
  const loading = ref(false)

  // 面包屑
  const breadcrumbs = ref<Array<{ title: string; path?: string }>>([])

  // 切换侧边栏
  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  // 设置加载状态
  function setLoading(value: boolean) {
    loading.value = value
  }

  // 设置面包屑
  function setBreadcrumbs(value: Array<{ title: string; path?: string }>) {
    breadcrumbs.value = value
  }

  return {
    sidebarCollapsed,
    loading,
    breadcrumbs,
    toggleSidebar,
    setLoading,
    setBreadcrumbs
  }
})