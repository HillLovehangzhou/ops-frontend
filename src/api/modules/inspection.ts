import { request } from '@/utils/request'
import type { InspectionTask, InspectionTaskListParams, InspectionRecord, PageResponse } from '@/types/api.d.ts'

// 获取巡检任务列表
export function getInspectionTaskList(params: InspectionTaskListParams): Promise<PageResponse<InspectionTask>> {
  return request.get('/inspections/tasks', { params })
}

// 获取巡检任务详情
export function getInspectionTaskDetail(id: number): Promise<InspectionTask> {
  return request.get(`/inspections/tasks/${id}`)
}

// 创建巡检任务
export function createInspectionTask(data: Partial<InspectionTask>): Promise<InspectionTask> {
  return request.post('/inspections/tasks', data)
}

// 更新巡检任务
export function updateInspectionTask(id: number, data: Partial<InspectionTask>): Promise<InspectionTask> {
  return request.put(`/inspections/tasks/${id}`, data)
}

// 删除巡检任务
export function deleteInspectionTask(id: number): Promise<void> {
  return request.delete(`/inspections/tasks/${id}`)
}

// 执行巡检
export function executeInspection(id: number, data: {
  result: number
  remark?: string
}): Promise<InspectionTask> {
  return request.post(`/inspections/tasks/${id}/execute`, data)
}

// 获取巡检记录列表
export function getInspectionRecordList(params: {
  page: number
  size: number
  deviceId?: number
  startTime?: number
  endTime?: number
}): Promise<PageResponse<InspectionRecord>> {
  return request.get('/inspections/records', { params })
}

// 获取巡检统计
export function getInspectionStats(): Promise<{
  today: number
  pending: number
  completed: number
  overdue: number
}> {
  return request.get('/inspections/stats')
}