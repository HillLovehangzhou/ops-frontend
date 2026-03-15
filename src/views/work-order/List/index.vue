<template>
  <div class="work-order-list-page">
    <!-- 搜索表单 -->
    <div class="search-form">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="工单标题">
          <a-input v-model:value="searchForm.title" placeholder="请输入工单标题" allow-clear />
        </a-form-item>
        <a-form-item label="工单状态">
          <a-select v-model:value="searchForm.status" placeholder="请选择状态" allow-clear style="width: 120px">
            <a-select-option :value="1">待处理</a-select-option>
            <a-select-option :value="2">处理中</a-select-option>
            <a-select-option :value="3">已完成</a-select-option>
            <a-select-option :value="4">已关闭</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="优先级">
          <a-select v-model:value="searchForm.priority" placeholder="请选择优先级" allow-clear style="width: 120px">
            <a-select-option :value="1">低</a-select-option>
            <a-select-option :value="2">中</a-select-option>
            <a-select-option :value="3">高</a-select-option>
            <a-select-option :value="4">紧急</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">查询</a-button>
            <a-button @click="handleReset">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </div>

    <!-- 操作按钮 -->
    <div class="table-actions">
      <a-button type="primary" @click="handleAdd">
        <PlusOutlined /> 创建工单
      </a-button>
    </div>

    <!-- 表格 -->
    <a-table
      :columns="columns"
      :data-source="tableData"
      :loading="loading"
      :pagination="pagination"
      row-key="id"
      @change="handleTableChange"
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
        <template v-if="column.key === 'action'">
          <a-space>
            <a-button type="link" size="small" @click="handleView(record)">
              查看
            </a-button>
            <a-button
              v-if="record.status === 1"
              type="link"
              size="small"
              @click="handleProcess(record)"
            >
              处理
            </a-button>
            <a-button
              v-if="record.status === 2"
              type="link"
              size="small"
              @click="handleComplete(record)"
            >
              完成
            </a-button>
            <a-popconfirm
              v-if="record.status !== 3 && record.status !== 4"
              title="确定要关闭该工单吗？"
              @confirm="handleClose(record)"
            >
              <a-button type="link" size="small" danger>关闭</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 创建工单弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      title="创建工单"
      :confirm-loading="modalLoading"
      @ok="handleModalOk"
      width="600px"
    >
      <a-form
        ref="formRef"
        :model="formState"
        :rules="formRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-item label="工单标题" name="title">
          <a-input v-model:value="formState.title" placeholder="请输入工单标题" />
        </a-form-item>
        <a-form-item label="关联设备" name="deviceId">
          <a-select v-model:value="formState.deviceId" placeholder="请选择设备" show-search>
            <a-select-option v-for="device in deviceOptions" :key="device.id" :value="device.id">
              {{ device.name }} ({{ device.code }})
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="优先级" name="priority">
          <a-select v-model:value="formState.priority" placeholder="请选择优先级">
            <a-select-option :value="1">低</a-select-option>
            <a-select-option :value="2">中</a-select-option>
            <a-select-option :value="3">高</a-select-option>
            <a-select-option :value="4">紧急</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="问题描述" name="description">
          <a-textarea v-model:value="formState.description" placeholder="请描述问题情况" :rows="4" />
        </a-form-item>
      </a-form>
    </a-modal>

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
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import {
  getWorkOrderList,
  createWorkOrder,
  processWorkOrder,
  completeWorkOrder,
  closeWorkOrder,
  getDeviceList
} from '@/api'
import { formatDateTime } from '@/utils/date'
import { WorkOrderStatusMap, PriorityMap } from '@/types/api.d.ts'
import type { WorkOrder, Device } from '@/types/api.d.ts'

const router = useRouter()

// 搜索表单
const searchForm = reactive({
  title: '',
  status: undefined as number | undefined,
  priority: undefined as number | undefined
})

// 表格
const loading = ref(false)
const tableData = ref<WorkOrder[]>([])
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
})

const columns = [
  { title: '工单编号', dataIndex: 'orderNo', width: 120 },
  { title: '工单标题', dataIndex: 'title', width: 200 },
  { title: '设备名称', dataIndex: 'deviceName', width: 150 },
  { title: '优先级', dataIndex: 'priority', key: 'priority', width: 80 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80 },
  { title: '创建人', dataIndex: 'creatorName', width: 100 },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 160 },
  { title: '操作', key: 'action', width: 180, fixed: 'right' as const }
]

// 设备选项
const deviceOptions = ref<Device[]>([])

// 创建工单弹窗
const modalVisible = ref(false)
const modalLoading = ref(false)
const formRef = ref()

const formState = reactive({
  title: '',
  deviceId: undefined as number | undefined,
  priority: 2,
  description: ''
})

const formRules = {
  title: [{ required: true, message: '请输入工单标题' }],
  deviceId: [{ required: true, message: '请选择关联设备' }],
  priority: [{ required: true, message: '请选择优先级' }],
  description: [{ required: true, message: '请描述问题情况' }]
}

// 处理工单弹窗
const processModalVisible = ref(false)
const processModalLoading = ref(false)
const processingOrder = ref<WorkOrder | null>(null)
const processForm = reactive({
  processNote: ''
})

// 完成工单弹窗
const completeModalVisible = ref(false)
const completeModalLoading = ref(false)
const completingOrder = ref<WorkOrder | null>(null)
const completeForm = reactive({
  solution: ''
})

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await getWorkOrderList({
      page: pagination.current - 1,
      size: pagination.pageSize,
      ...searchForm
    })
    tableData.value = res.content
    pagination.total = res.totalElements
  } catch (error) {
    console.error('Failed to load work orders:', error)
  } finally {
    loading.value = false
  }
}

// 加载设备选项
const loadDevices = async () => {
  try {
    const res = await getDeviceList({ page: 0, size: 1000 })
    deviceOptions.value = res.content
  } catch (error) {
    console.error('Failed to load devices:', error)
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  loadData()
}

// 重置
const handleReset = () => {
  searchForm.title = ''
  searchForm.status = undefined
  searchForm.priority = undefined
  handleSearch()
}

// 表格变化
const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadData()
}

// 新增
const handleAdd = () => {
  Object.assign(formState, {
    title: '',
    deviceId: undefined,
    priority: 2,
    description: ''
  })
  modalVisible.value = true
}

// 查看
const handleView = (record: WorkOrder) => {
  router.push(`/work-order/detail/${record.id}`)
}

// 处理
const handleProcess = (record: WorkOrder) => {
  processingOrder.value = record
  processForm.processNote = ''
  processModalVisible.value = true
}

// 完成
const handleComplete = (record: WorkOrder) => {
  completingOrder.value = record
  completeForm.solution = ''
  completeModalVisible.value = true
}

// 关闭
const handleClose = async (record: WorkOrder) => {
  try {
    await closeWorkOrder(record.id)
    message.success('工单已关闭')
    loadData()
  } catch (error) {
    message.error('操作失败')
  }
}

// 创建确认
const handleModalOk = async () => {
  try {
    await formRef.value?.validate()
    modalLoading.value = true
    await createWorkOrder(formState)
    message.success('创建成功')
    modalVisible.value = false
    loadData()
  } catch (error) {
    console.error('Form validation failed:', error)
  } finally {
    modalLoading.value = false
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
    await processWorkOrder(processingOrder.value!.id, { processNote: processForm.processNote })
    message.success('工单已开始处理')
    processModalVisible.value = false
    loadData()
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
    await completeWorkOrder(completingOrder.value!.id, { solution: completeForm.solution })
    message.success('工单已完成')
    completeModalVisible.value = false
    loadData()
  } catch (error) {
    message.error('操作失败')
  } finally {
    completeModalLoading.value = false
  }
}

onMounted(() => {
  loadData()
  loadDevices()
})
</script>

<style lang="less" scoped>
.work-order-list-page {
  .search-form {
    margin-bottom: 16px;
    padding: 16px;
    background: #fff;
    border-radius: 4px;
  }

  .table-actions {
    margin-bottom: 16px;
  }
}
</style>
