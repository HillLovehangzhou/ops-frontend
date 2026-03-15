// 用户相关类型
export interface User {
  id: number
  username: string
  realName: string
  email: string
  phone: string
  roles: string[]
  avatar?: string
  status: number
  createTime: number
}

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResult {
  token: string
  user: User
}

// 设备相关类型
export interface Device {
  id: number
  code: string
  name: string
  model: string
  type: string
  location: string
  status: number // 1-正常 2-维修中 3-停用
  statusText: string
  parameters: Record<string, string>
  createTime: number
  updateTime: number
}

export interface DeviceListParams {
  page: number
  size: number
  name?: string
  type?: string
  status?: number
}

// 巡检相关类型
export interface InspectionTask {
  id: number
  taskNo: string
  name: string
  deviceId: number
  deviceName: string
  deviceCode: string
  executorId: number
  executorName: string
  planTime: number
  executeTime?: number
  status: number // 1-待执行 2-执行中 3-已完成 4-已超期
  statusText: string
  result?: number // 1-正常 2-异常
  resultText?: string
  remark?: string
  createTime: number
}

export interface InspectionTaskListParams {
  page: number
  size: number
  name?: string
  status?: number
  executorId?: number
}

export interface InspectionRecord {
  id: number
  taskId: number
  taskNo: string
  taskName: string
  deviceName: string
  executorName: string
  executeTime: number
  result: number
  resultText: string
  remark: string
  createTime: number
}

// 工单相关类型
export interface WorkOrder {
  id: number
  orderNo: string
  title: string
  deviceId: number
  deviceName: string
  deviceCode: string
  reporterId: number
  reporterName: string
  assigneeId?: number
  assigneeName?: string
  priority: number // 1-低 2-中 3-高
  priorityText: string
  status: number // 1-待处理 2-处理中 3-已完成 4-已关闭
  statusText: string
  description: string
  solution?: string
  createTime: number
  updateTime: number
  completeTime?: number
}

export interface WorkOrderListParams {
  page: number
  size: number
  title?: string
  status?: number
  priority?: number
}

// 统计相关类型
export interface DashboardStats {
  deviceTotal: number
  deviceNormal: number
  deviceRepair: number
  deviceStopped: number
  todayInspection: number
  pendingInspection: number
  completedInspection: number
  overdueInspection: number
  pendingOrder: number
  processingOrder: number
  completedOrder: number
}

export interface ChartData {
  name: string
  value: number
}

// 分页响应
export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

// API响应
export interface ApiResponse<T = any> {
  code: number
  msg: string
  data: T
}

// 菜单类型
export interface MenuItem {
  id: number
  name: string
  path: string
  icon?: string
  children?: MenuItem[]
  meta?: {
    title: string
    icon?: string
    hidden?: boolean
  }
}

// 角色枚举
export enum RoleEnum {
  ADMIN = 'ROLE_ADMIN',
  INSPECTOR = 'ROLE_INSPECTOR',
  REPAIRMAN = 'ROLE_REPAIRMAN'
}

// 角色名称映射
export const RoleNameMap: Record<string, string> = {
  'ROLE_ADMIN': '管理员',
  'ROLE_INSPECTOR': '巡检员',
  'ROLE_REPAIRMAN': '维修员'
}

// 设备状态映射
export const DeviceStatusMap: Record<number, { text: string; color: string }> = {
  1: { text: '正常', color: 'success' },
  2: { text: '维修中', color: 'warning' },
  3: { text: '停用', color: 'default' }
}

// 巡检状态映射
export const InspectionStatusMap: Record<number, { text: string; color: string }> = {
  1: { text: '待执行', color: 'default' },
  2: { text: '执行中', color: 'processing' },
  3: { text: '已完成', color: 'success' },
  4: { text: '已超期', color: 'error' }
}

// 工单状态映射
export const WorkOrderStatusMap: Record<number, { text: string; color: string }> = {
  1: { text: '待处理', color: 'default' },
  2: { text: '处理中', color: 'processing' },
  3: { text: '已完成', color: 'success' },
  4: { text: '已关闭', color: 'default' }
}

// 优先级映射
export const PriorityMap: Record<number, { text: string; color: string }> = {
  1: { text: '低', color: 'default' },
  2: { text: '中', color: 'warning' },
  3: { text: '高', color: 'error' }
}