import { request } from '@/utils/request'
import type { WorkOrder, WorkOrderListParams, PageResponse } from '@/types/api.d.ts'

// 获取工单列表
export function getWorkOrderList(params: WorkOrderListParams): Promise<PageResponse<WorkOrder>> {
  return request.get('/work-orders', { params })
}

// 获取工单详情
export function getWorkOrderDetail(id: number): Promise<WorkOrder> {
  return request.get(`/work-orders/${id}`)
}

// 创建工单
export function createWorkOrder(data: Partial<WorkOrder>): Promise<WorkOrder> {
  return request.post('/work-orders', data)
}

// 更新工单
export function updateWorkOrder(id: number, data: Partial<WorkOrder>): Promise<WorkOrder> {
  return request.put(`/work-orders/${id}`, data)
}

// 删除工单
export function deleteWorkOrder(id: number): Promise<void> {
  return request.delete(`/work-orders/${id}`)
}

// 接单
export function acceptWorkOrder(id: number): Promise<WorkOrder> {
  return request.post(`/work-orders/${id}/accept`)
}

// 处理工单
export function processWorkOrder(id: number, data: {
  processNote: string
}): Promise<WorkOrder> {
  return request.post(`/work-orders/${id}/process`, data)
}

// 完成工单
export function completeWorkOrder(id: number, data: {
  solution: string
}): Promise<WorkOrder> {
  return request.post(`/work-orders/${id}/complete`, data)
}

// 关闭工单
export function closeWorkOrder(id: number): Promise<WorkOrder> {
  return request.post(`/work-orders/${id}/close`)
}

// 获取工单统计
export function getWorkOrderStats(): Promise<{
  pending: number
  processing: number
  completed: number
}> {
  return request.get('/work-orders/stats')
}