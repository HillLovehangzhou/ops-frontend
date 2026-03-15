<template>
  <div class="work-order-detail-page">
    <a-spin :spinning="loading">
      <template v-if="workOrder">
        <!-- 基本信息 -->
        <a-card title="工单信息" class="info-card">
          <template #extra>
            <a-space>
              <a-button v-if="workOrder.status === 1" type="primary" @click="handleProcess">
                处理工单
              </a-button>
              <a-button v-if="workOrder.status === 2" type="primary" @click="handleComplete">
                完成工单
              </a-button>
              <a-popconfirm
                v-if="workOrder.status !== 3 && workOrder.status !== 4"
                title="确定要关闭该工单吗？"
                @confirm="handleClose"
              >
                <a-button danger>关闭工单</a-button>
              </a-popconfirm>
            </a-space>
          </template>
          <a-descriptions :column="3" bordered>
            <a-descriptions-item label="工单编号">{{ workOrder.orderNo }}</a-descriptions-item>
            <a-descriptions-item label="工单标题">{{ workOrder.title }}</a-descriptions-item>
            <a-descriptions-item label="优先级">
              <a-tag :color="PriorityMap[workOrder.priority]?.color">
                {{ PriorityMap[workOrder.priority]?.text }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="工单状态">
              <a-tag :color="WorkOrderStatusMap[workOrder.status]?.color">
                {{ WorkOrderStatusMap[workOrder.status]?.text }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="关联设备">
              <a @click="goToDevice" style="cursor: pointer; color: #1890ff">
                {{ workOrder.deviceName }}
              </a>
            </a-descriptions-item>
            <a-descriptions-item label="创建人">{{ workOrder.creatorName }}</a-descriptions-item>
            <a-descriptions-item label="创建时间">{{ formatDateTime(workOrder.createTime) }}</a-descriptions-item>
            <a-descriptions-item label="处理人">{{ workOrder.handlerName || '-' }}</a-descriptions-item>
            <a-descriptions-item label="完成时间">{{ formatDateTime(workOrder.completeTime) || '-' }}</a-descriptions-item>
            <a-descriptions-item label="问题描述" :span="3">{{ workOrder.description }}</a-descriptions-item>
            <a-descriptions-item label="处理说明" :span="3">{{ workOrder.processNote || '-' }}</a-descriptions-item>
            <a-descriptions-item label="解决方案" :span="3">{{ workOrder.solution || '-' }}</a-descriptions-item>
          </a-descriptions>
        </a-card>

        <!-- 处理记录 -->
        <a-card title="处理记录" class="info-card">
          <a-timeline v-if="workOrder.logs && workOrder.logs.length > 0">
            <a-timeline-item v-for="log in workOrder.logs" :key="log.id" :color="getLogColor(log.action)">
              <p><strong>{{ log.actionText }}</strong></p>
              <p>{{ log.content }}</p>
              <p style="color: #999; font-size: 12px">
                {{ log.operatorName }} · {{ formatDateTime(log.createTime) }}
              </p>
            </a-timeline-item>
          </a-timeline>
          <a-empty v-else description="暂无处理记录" />
        </a-card>
      </template>
    </a-spin>

    <!-- 处理工单弹窗 -->
    <a-modal
      v-model:open="processModalVisible"
      title="处理工单"
      :confirm-loading="processModalLoading"
      @ok="handleProcessOk"
      width="500px"
    >
      <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="处理说明" required>
          <a-textarea v-model:value="processForm.processNote" placeholder="请填写处理说明" :rows="4" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 完成工单弹窗 -->
    <a-modal
      v-model:open="completeModalVisible"
      title="完成工单"
      :confirm-loading="completeModalLoading"
      @ok="handleCompleteOk"
      width="500px"
    >
      <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="解决方案" required>
          <a-textarea v-model:value="completeForm.solution" placeholder="请填写解决方案" :rows="4" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { getWorkOrderDetail, processWorkOrder, completeWorkOrder, closeWorkOrder } from '@/api'
import { formatDateTime } from '@/utils/date'
import { WorkOrderStatusMap, PriorityMap } from '@/types/api.d.ts'
import type { WorkOrder } from '@/types/api.d.ts'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const workOrder = ref<WorkOrder | null>(null)

// 处理工单弹窗
const processModalVisible = ref(false)
const processModalLoading = ref(false)
const processForm = reactive({
  processNote: ''
})

// 完成工单弹窗
const completeModalVisible = ref(false)
const completeModalLoading = ref(false)
const completeForm = reactive({
  solution: ''
})

// 加载工单详情
const loadWorkOrder = async () => {
  const id = route.params.id as string
  loading.value = true
  try {
    const data = await getWorkOrderDetail(Number(id))
    workOrder.value = data
  } catch (error) {
    console.error('Failed to load work order:', error)
  } finally {
    loading.value = false
  }
}

// 获取日志颜色
const getLogColor = (action: string) => {
  const colorMap: Record<string, string> = {
    'create': 'blue',
    'process': 'orange',
    'complete': 'green',
    'close': 'gray'
  }
  return colorMap[action] || 'gray'
}

// 跳转到设备详情
const goToDevice = () => {
  if (workOrder.value?.deviceId) {
    router.push(`/device/detail/${workOrder.value.deviceId}`)
  }
}

// 处理工单
const handleProcess = () => {
  processForm.processNote = ''
  processModalVisible.value = true
}

// 完成工单
const handleComplete = () => {
  completeForm.solution = ''
  completeModalVisible.value = true
}

// 关闭工单
const handleClose = async () => {
  try {
    await closeWorkOrder(workOrder.value!.id)
    message.success('工单已关闭')
    loadWorkOrder()
  } catch (error) {
    message.error('操作失败')
  }
}

// 处理确认
const handleProcessOk = async () => {
  if (!processForm.processNote) {
    message.error('请填写处理说明')
    return
  }
  processModalLoading.value = true
  try {
    await processWorkOrder(workOrder.value!.id, { processNote: processForm.processNote })
    message.success('工单已开始处理')
    processModalVisible.value = false
    loadWorkOrder()
  } catch (error) {
    message.error('操作失败')
  } finally {
    processModalLoading.value = false
  }
}

// 完成确认
const handleCompleteOk = async () => {
  if (!completeForm.solution) {
    message.error('请填写解决方案')
    return
  }
  completeModalLoading.value = true
  try {
    await completeWorkOrder(workOrder.value!.id, { solution: completeForm.solution })
    message.success('工单已完成')
    completeModalVisible.value = false
    loadWorkOrder()
  } catch (error) {
    message.error('操作失败')
  } finally {
    completeModalLoading.value = false
  }
}

onMounted(() => {
  loadWorkOrder()
})
</script>

<style lang="less" scoped>
.work-order-detail-page {
  .info-card {
    margin-bottom: 16px;
  }
}
</style>
