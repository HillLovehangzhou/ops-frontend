import { request } from '@/utils/request'
import type { DashboardStats, ChartData } from '@/types/api.d.ts'

// 获取仪表盘统计数据
export function getDashboardStats(): Promise<DashboardStats> {
  return request.get('/dashboard/stats')
}

// 获取设备状态分布
export function getDeviceStatusChart(): Promise<ChartData[]> {
  return request.get('/dashboard/charts/device-status')
}

// 获取工单趋势
export function getWorkOrderTrend(days: number = 7): Promise<ChartData[]> {
  return request.get('/dashboard/charts/work-order-trend', { params: { days } })
}

// 获取巡检完成率
export function getInspectionCompletion(): Promise<{
  completed: number
  total: number
  rate: number
}> {
  return request.get('/dashboard/charts/inspection-completion')
}