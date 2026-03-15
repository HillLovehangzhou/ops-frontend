<template>
  <div class="inspection-record-page">
    <!-- 搜索表单 -->
    <div class="search-form">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="设备名称">
          <a-input v-model:value="searchForm.deviceName" placeholder="请输入设备名称" allow-clear />
        </a-form-item>
        <a-form-item label="巡检结果">
          <a-select v-model:value="searchForm.result" placeholder="请选择结果" allow-clear style="width: 120px">
            <a-select-option :value="1">正常</a-select-option>
            <a-select-option :value="2">异常</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="执行时间">
          <a-range-picker
            v-model:value="searchForm.dateRange"
            format="YYYY-MM-DD"
            :placeholder="['开始日期', '结束日期']"
          />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">查询</a-button>
            <a-button @click="handleReset">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>
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
        <template v-if="column.key === 'result'">
          <a-tag :color="record.result === 1 ? 'success' : 'error'">
            {{ record.result === 1 ? '正常' : '异常' }}
          </a-tag>
        </template>
        <template v-if="column.key === 'executeTime'">
          {{ formatDateTime(record.executeTime) }}
        </template>
        <template v-if="column.key === 'action'">
          <a-button type="link" size="small" @click="handleView(record)">
            查看详情
          </a-button>
        </template>
      </template>
    </a-table>

    <!-- 详情弹窗 -->
    <a-modal
      v-model:open="detailVisible"
      title="巡检记录详情"
      :footer="null"
      width="600px"
    >
      <a-descriptions :column="2" bordered v-if="currentRecord">
        <a-descriptions-item label="任务编号">{{ currentRecord.taskNo }}</a-descriptions-item>
        <a-descriptions-item label="任务名称">{{ currentRecord.taskName }}</a-descriptions-item>
        <a-descriptions-item label="设备名称">{{ currentRecord.deviceName }}</a-descriptions-item>
        <a-descriptions-item label="执行人">{{ currentRecord.executorName }}</a-descriptions-item>
        <a-descriptions-item label="执行时间">{{ formatDateTime(currentRecord.executeTime) }}</a-descriptions-item>
        <a-descriptions-item label="巡检结果">
          <a-tag :color="currentRecord.result === 1 ? 'success' : 'error'">
            {{ currentRecord.result === 1 ? '正常' : '异常' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="备注" :span="2">{{ currentRecord.remark || '-' }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getInspectionRecordList } from '@/api'
import { formatDateTime } from '@/utils/date'
import type { InspectionRecord } from '@/types/api.d.ts'

// 搜索表单
const searchForm = reactive({
  deviceName: '',
  result: undefined as number | undefined,
  dateRange: null as any
})

// 表格
const loading = ref(false)
const tableData = ref<InspectionRecord[]>([])
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
})

const columns = [
  { title: '任务编号', dataIndex: 'taskNo', width: 120 },
  { title: '任务名称', dataIndex: 'taskName', width: 150 },
  { title: '设备名称', dataIndex: 'deviceName', width: 150 },
  { title: '执行人', dataIndex: 'executorName', width: 100 },
  { title: '执行时间', dataIndex: 'executeTime', key: 'executeTime', width: 160 },
  { title: '结果', dataIndex: 'result', key: 'result', width: 80 },
  { title: '备注', dataIndex: 'remark', ellipsis: true },
  { title: '操作', key: 'action', width: 100, fixed: 'right' as const }
]

// 详情弹窗
const detailVisible = ref(false)
const currentRecord = ref<InspectionRecord | null>(null)

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pagination.current - 1,
      size: pagination.pageSize,
      deviceName: searchForm.deviceName || undefined,
      result: searchForm.result
    }
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      params.startTime = searchForm.dateRange[0].startOf('day').valueOf()
      params.endTime = searchForm.dateRange[1].endOf('day').valueOf()
    }
    const res = await getInspectionRecordList(params)
    tableData.value = res.content
    pagination.total = res.totalElements
  } catch (error) {
    console.error('Failed to load records:', error)
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
  searchForm.deviceName = ''
  searchForm.result = undefined
  searchForm.dateRange = null
  handleSearch()
}

// 表格变化
const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadData()
}

// 查看详情
const handleView = (record: InspectionRecord) => {
  currentRecord.value = record
  detailVisible.value = true
}

onMounted(() => {
  loadData()
})
</script>

<style lang="less" scoped>
.inspection-record-page {
  .search-form {
    margin-bottom: 16px;
    padding: 16px;
    background: #fff;
    border-radius: 4px;
  }
}
</style>
