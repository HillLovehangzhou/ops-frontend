<template>
  <div class="error-page">
    <a-result
      status="403"
      title="403"
      sub-title="抱歉，您没有权限访问此页面"
    >
      <template #extra>
        <a-button type="primary" @click="goBack">返回上一页</a-button>
        <a-button @click="goHome">返回首页</a-button>
      </template>
    </a-result>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/modules/user'
import { getFirstAllowedPath } from '@/router'

const router = useRouter()
const userStore = useUserStore()

const goBack = () => {
  router.back()
}

const goHome = () => {
  const target = getFirstAllowedPath(userStore.roles)
  if (target === '/login') {
    // 如果没有权限访问任何页面，清除登录状态后跳转登录页
    userStore.logout()
  } else {
    router.replace(target)
  }
}
</script>

<style lang="less" scoped>
.error-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}
</style>
