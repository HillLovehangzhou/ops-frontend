<template>
  <div class="device-detail-page">
    <a-spin :spinning="loading">
      <template v-if="device">
        <!-- 基本信息 -->
        <a-card title="基本信息" class="info-card">
          <template #extra>
            <a-button type="primary" @click="handleEdit">
              <EditOutlined /> 编辑
            </a-button>
          </template>
          <a-descriptions :column="3" bordered>
            <a-descriptions-item label="设备编号">{{ device.code }}</a-descriptions-item>
            <a-descriptions-item label="设备名称">{{ device.name }}</a-descriptions-item>
            <a-descriptions-item label="设备型号">{{ device.model }}</a-descriptions-item>
            <a-descriptions-item label="设备类型">{{ device.type }}</a-descriptions-item>
            <a-descriptions-item label="安装位置">{{ device.location }}</a-descriptions-item>
            <a-descriptions-item label="设备状态">
              <a-tag :color="DeviceStatusMap[device.status]?.color">
                {{ DeviceStatusMap[device.status]?.text }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="创建时间">{{ formatDateTime(device.createTime) }}</a-descriptions-item>
            <a-descriptions-item label="更新时间">{{ formatDateTime(device.updateTime) }}</a-descriptions-item>
          </a-descriptions>
        </a-card>

        <!-- 设备参数 -->
        <a-card title="设备参数" class="info-card">
          <a-descriptions :column="2" bordered>
            <a-descriptions-item
              v-for="(value, key) in device.parameters"
              :key="key"
              :label="key"
            >
              {{ value }}
            </a-descriptions-item>
          </a-descriptions>
        </a-card>

        <!-- 历史巡检记录 -->
        <a-card title="历史巡检记录" class="info-card">
          <a-table
            :columns="inspectionColumns"
            :data-source="inspectionRecords"
            :pagination="false"
            size="small"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'result'">
                <a-tag :color="record.result === 1 ? 'success' : 'error'">
                  {{ record.result === 1 ? '正常' : '异常' }}
                </a-tag>
              </template>
              <template v-if="column.key === 'executeTime'">
                {{ formatDateTime(record.executeTime) }}
              </template>
            </template>
          </a-table>
        </a-card>

        <!-- 历史维修记录 -->
        <a-card title="历史维修记录" class="info-card">
          <a-table
            :columns="repairColumns"
            :data-source="repairRecords"
            :pagination="false"
            size="small"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <a-tag :color="WorkOrderStatusMap[record.status]?.color">
                  {{ WorkOrderStatusMap[record.status]?.text }}
                </a-tag>
              </template>
              <template v-if="column.key === 'priority'">
                <a-tag :color="PriorityMap[record.priority]?.color">
                  {{ PriorityMap[record.priority]?.text }}
                </a-tag>
              </template>
              <template v-if="column.key === 'createTime'">
                {{ formatDateTime(record.createTime) }}
              </template>
            </template>
          </a-table>
        </a-card>
      </template>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { EditOutlined } from '@ant-design/icons-vue'
import { getDeviceDetail } from '@/api'
import { formatDateTime } from '@/utils/date'
import { DeviceStatusMap, WorkOrderStatusMap, PriorityMap } from '@/types/api.d.ts'
import type { Device, InspectionRecord, WorkOrder } from '@/types/api.d.ts'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const device = ref<Device | null>(null)
const inspectionRecords = ref<InspectionRecord[]>([])
const repairRecords = ref<WorkOrder[]>([])

const inspectionColumns = [
  { title: '任务编号', dataIndex: 'taskNo', width: 120 },
  { title: '任务名称', dataIndex: 'taskName', width: 150 },
  { title: '执行人', dataIndex: 'executorName', width: 100 },
  { title: '执行时间', dataIndex: 'executeTime', key: 'executeTime', width: 160 },
  { title: '结果', dataIndex: 'result', key: 'result', width: 80 },
  { title: '备注', dataIndex: 'remark', ellipsis: true }
]

const repairColumns = [
  { title: '工单编号', dataIndex: 'orderNo', width: 120 },
  { title: '工单标题', dataIndex: 'title', width: 150 },
  { title: '优先级', dataIndex: 'priority', key: 'priority', width: 80 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80 },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 160 },
  { title: '解决方案', dataIndex: 'solution', ellipsis: true }
]

// 加载设备详情
const loadDevice = async () => {
  const id = route.params.id as string
  loading.value = true
  try {
    const data = await getDeviceDetail(Number(id))
    device.value = data
    // TODO: 加载巡检记录和维修记录
  } catch (error) {
    console.error('Failed to load device:', error)
  } finally {
    loading.value = false
  }
}

// 编辑
const handleEdit = () => {
  router.push(`/device/edit/${device.value?.id}`)
}

onMounted(() => {
  loadDevice()
})
</script>

<style lang="less" scoped>
.device-detail-page {
  .info-card {
    margin-bottom: 16px;
  }
}
</style>