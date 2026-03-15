<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <img src="/favicon.svg" alt="Logo" class="logo" />
        <h1 class="title">运维管理系统</h1>
        <p class="subtitle">设备档案 · 巡检管理 · 工单管理</p>
      </div>

      <a-form
        :model="formState"
        :rules="rules"
        @finish="handleSubmit"
        class="login-form"
      >
        <a-form-item name="username">
          <a-input
            v-model:value="formState.username"
            size="large"
            placeholder="请输入用户名"
          >
            <template #prefix>
              <UserOutlined />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item name="password">
          <a-input-password
            v-model:value="formState.password"
            size="large"
            placeholder="请输入密码"
          >
            <template #prefix>
              <LockOutlined />
            </template>
          </a-input-password>
        </a-form-item>

        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            size="large"
            block
            :loading="loading"
          >
            登录
          </a-button>
        </a-form-item>
      </a-form>

      <div class="login-tips">
        <p>测试账号：</p>
        <p>管理员：admin / admin123</p>
        <p>巡检员：inspector / inspector123</p>
        <p>维修员：repairman / repairman123</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/modules/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)

const formState = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名' }
  ],
  password: [
    { required: true, message: '请输入密码' }
  ]
}

const handleSubmit = async () => {
  loading.value = true
  try {
    await userStore.login(formState)
    message.success('登录成功')

    // 跳转到之前的页面或首页
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  } catch (error: any) {
    message.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="less" scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
}

.login-box {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;

  .logo {
    width: 60px;
    height: 60px;
    margin-bottom: 16px;
  }

  .title {
    font-size: 24px;
    font-weight: 600;
    color: @text-color;
    margin: 0 0 8px;
  }

  .subtitle {
    font-size: 14px;
    color: @text-color-secondary;
    margin: 0;
  }
}

.login-form {
  .ant-input-affix-wrapper {
    border-radius: 4px;
  }
}

.login-tips {
  margin-top: 24px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 12px;
  color: @text-color-secondary;

  p {
    margin: 0;
    line-height: 1.8;
  }
}
</style>