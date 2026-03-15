import { createPinia } from 'pinia'

const pinia = createPinia()

export default pinia

// 导出所有 Store
export * from './modules/user'
export * from './modules/app'