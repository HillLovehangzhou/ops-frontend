<template>
  <div class="inspection-task-page">
    <!-- 搜索表单 -->
    <div class="search-form">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="任务名称">
          <a-input v-model:value="searchForm.name" placeholder="请输入任务名称" allow-clear />
        </a-form-item>
        <a-form-item label="任务状态">
          <a-select v-model:value="searchForm.status" placeholder="请选择状态" allow-clear style="width: 120px">
            <a-select-option :value="1">待执行</a-select-option>
            <a-select-option :value="2">执行中</a-select-option>
            <a-select-option :value="3">已完成</a-select-option>
            <a-select-option :value="4">已超期</a-select-option>
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
        <PlusOutlined /> 创建任务
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
          <a-tag :color="InspectionStatusMap[record.status]?.color">
            {{ InspectionStatusMap[record.status]?.text }}
          </a-tag>
        </template>
        <template v-if="column.key === 'result'">
          <a-tag v-if="record.result" :color="record.result === 1 ? 'success' : 'error'">
            {{ record.result === 1 ? '正常' : '异常' }}
          </a-tag>
          <span v-else>-</span>
        </template>
        <template v-if="column.key === 'planTime'">
          {{ formatDateTime(record.planTime) }}
        </template>
        <template v-if="column.key === 'action'">
          <a-space>
            <a-button
              v-if="record.status === 1"
              type="link"
              size="small"
              @click="handleExecute(record)"
            >
              执行巡检
            </a-button>
            <a-button type="link" size="small" @click="handleEdit(record)">
              编辑
            </a-button>
            <a-popconfirm
              title="确定要删除该任务吗？"
              @confirm="handleDelete(record)"
            >
              <a-button type="link" size="small" danger>删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 创建/编辑任务弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      :confirm-loading="modalLoading"
      @ok="handleModalOk"
      width="500px"
    >
      <a-form
        ref="formRef"
        :model="formState"
        :rules="formRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-item label="任务名称" name="name">
          <a-input v-model:value="formState.name" placeholder="请输入任务名称" />
        </a-form-item>
        <a-form-item label="巡检设备" name="deviceId">
          <a-select v-model:value="formState.deviceId" placeholder="请选择设备" show-search>
            <a-select-option v-for="device in deviceOptions" :key="device.id" :value="device.id">
              {{ device.name }} ({{ device.code }})
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="执行人" name="executorId">
          <a-select v-model:value="formState.executorId" placeholder="请选择执行人">
            <a-select-option v-for="user in userOptions" :key="user.id" :value="user.id">
              {{ user.realName }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="计划时间" name="planTime">
          <a-date-picker
            v-model:value="formState.planTimeValue"
            show-time
            format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择计划时间"
            style="width: 100%"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 执行巡检弹窗 -->
    <a-modal
      v-model:open="executeModalVisible"
      title="执行巡检"
      :confirm-loading="executeModalLoading"
      @ok="handleExecuteOk"
      width="500px"
    >
      <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="巡检结果" required>
          <a-radio-group v-model:value="executeForm.result">
            <a-radio :value="1">正常</a-radio>
            <a-radio :value="2">异常</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item v-if="executeForm.result === 2" label="异常描述" required>
          <a-textarea v-model:value="executeForm.remark" placeholder="请描述异常情况" :rows="4" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import {
  getInspectionTaskList,
  createInspectionTask,
  updateInspectionTask,
  deleteInspectionTask,
  executeInspection
} from '@/api'
import { formatDateTime } from '@/utils/date'
import { InspectionStatusMap } from '@/types/api.d.ts'
import type { InspectionTask, Device, User } from '@/types/api.d.ts'

// 搜索表单
const searchForm = reactive({
  name: '',
  status: undefined as number | undefined
})

// 表格
const loading = ref(false)
const tableData = ref<InspectionTask[]>([])
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
})

const columns = [
  { title: '任务编号', dataIndex: 'taskNo', width: 120 },
  { title: '任务名称', dataIndex: 'name', width: 150 },
  { title: '设备名称', dataIndex: 'deviceName', width: 150 },
  { title: '执行人', dataIndex: 'executorName', width: 100 },
  { title: '计划时间', dataIndex: 'planTime', key: 'planTime', width: 160 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80 },
  { title: '结果', dataIndex: 'result', key: 'result', width: 80 },
  { title: '操作', key: 'action', width: 180, fixed: 'right' as const }
]

// 设备和用户选项
const deviceOptions = ref<Device[]>([])
const userOptions = ref<User[]>([])

// 创建/编辑弹窗
const modalVisible = ref(false)
const modalLoading = ref(false)
const modalTitle = ref('创建任务')
const formRef = ref()
const editingId = ref<number | null>(null)

const formState = reactive({
  name: '',
  deviceId: undefined as number | undefined,
  executorId: undefined as number | undefined,
  planTimeValue: null as any
})

const formRules = {
  name: [{ required: true, message: '请输入任务名称' }],
  deviceId: [{ required: true, message: '请选择巡检设备' }],
  executorId: [{ required: true, message: '请选择执行人' }],
  planTimeValue: [{ required: true, message: '请选择计划时间' }]
}

// 执行巡检弹窗
const executeModalVisible = ref(false)
const executeModalLoading = ref(false)
const executingTask = ref<InspectionTask | null>(null)
const executeForm = reactive({
  result: 1,
  remark: ''
})

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await getInspectionTaskList({
      page: pagination.current - 1,
      size: pagination.pageSize,
      ...searchForm
    })
    tableData.value = res.content
    pagination.total = res.totalElements
  } catch (error) {
    console.error('Failed to load tasks:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  loadData()
}

// 重置
const handleReset = () => {
  searchForm.name = ''
  searchForm.status = undefined
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
  modalTitle.value = '创建任务'
  editingId.value = null
  Object.assign(formState, {
    name: '',
    deviceId: undefined,
    executorId: undefined,
    planTimeValue: null
  })
  modalVisible.value = true
}

// 编辑
const handleEdit = (record: InspectionTask) => {
  modalTitle.value = '编辑任务'
  editingId.value = record.id
  Object.assign(formState, {
    name: record.name,
    deviceId: record.deviceId,
    executorId: record.executorId,
    planTimeValue: record.planTime ? dayjs(record.planTime) : null
  })
  modalVisible.value = true
}

// 删除
const handleDelete = async (record: InspectionTask) => {
  try {
    await deleteInspectionTask(record.id)
    message.success('删除成功')
    loadData()
  } catch (error) {
    message.error('删除失败')
  }
}

// 弹窗确认
const handleModalOk = async () => {
  try {
    await formRef.value?.validate()
    modalLoading.value = true

    const data = {
      ...formState,
      planTime: formState.planTimeValue?.valueOf()
    }

    if (editingId.value) {
      await updateInspectionTask(editingId.value, data)
      message.success('更新成功')
    } else {
      await createInspectionTask(data)
      message.success('创建成功')
    }

    modalVisible.value = false
    loadData()
  } catch (error) {
    console.error('Form validation failed:', error)
  } finally {
    modalLoading.value = false
  }
}

// 执行巡检
const handleExecute = (record: InspectionTask) => {
  executingTask.value = record
  executeForm.result = 1
  executeForm.remark = ''
  executeModalVisible.value = true
}

// 执行确认
const handleExecuteOk = async () => {
  if (executeForm.result === 2 && !executeForm.remark) {
    message.error('请填写异常描述')
    return
  }

  executeModalLoading.value = true
  try {
    await executeInspection(executingTask.value!.id, {
      result: executeForm.result,
      remark: executeForm.remark
    })
    message.success('巡检完成')
    executeModalVisible.value = false
    loadData()
  } catch (error) {
    message.error('执行失败')
  } finally {
    executeModalLoading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style lang="less" scoped>
.inspection-task-page {
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