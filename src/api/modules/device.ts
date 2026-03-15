import { request } from '@/utils/request'
import type { Device, DeviceListParams, PageResponse } from '@/types/api.d.ts'

// 获取设备列表
export function getDeviceList(params: DeviceListParams): Promise<PageResponse<Device>> {
  return request.get('/devices', { params })
}

// 获取设备详情
export function getDeviceDetail(id: number): Promise<Device> {
  return request.get(`/devices/${id}`)
}

// 创建设备
export function createDevice(data: Partial<Device>): Promise<Device> {
  return request.post('/devices', data)
}

// 更新设备
export function updateDevice(id: number, data: Partial<Device>): Promise<Device> {
  return request.put(`/devices/${id}`, data)
}

// 删除设备
export function deleteDevice(id: number): Promise<void> {
  return request.delete(`/devices/${id}`)
}

// 获取设备类型列表
export function getDeviceTypes(): Promise<string[]> {
  return request.get('/devices/types')
}

// 获取设备统计
export function getDeviceStats(): Promise<{
  total: number
  normal: number
  repair: number
  stopped: number
}> {
  return request.get('/devices/stats')
}