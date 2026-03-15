<template>
  <div class="device-list-page">
    <!-- 搜索表单 -->
    <div class="search-form">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="设备名称">
          <a-input v-model:value="searchForm.name" placeholder="请输入设备名称" allow-clear />
        </a-form-item>
        <a-form-item label="设备类型">
          <a-select v-model:value="searchForm.type" placeholder="请选择类型" allow-clear style="width: 150px">
            <a-select-option value="空调">空调</a-select-option>
            <a-select-option value="电梯">电梯</a-select-option>
            <a-select-option value="消防设备">消防设备</a-select-option>
            <a-select-option value="配电设备">配电设备</a-select-option>
            <a-select-option value="给排水设备">给排水设备</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="设备状态">
          <a-select v-model:value="searchForm.status" placeholder="请选择状态" allow-clear style="width: 120px">
            <a-select-option :value="1">正常</a-select-option>
            <a-select-option :value="2">维修中</a-select-option>
            <a-select-option :value="3">停用</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">
              <SearchOutlined /> 查询
            </a-button>
            <a-button @click="handleReset">
              <ReloadOutlined /> 重置
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </div>

    <!-- 操作按钮 -->
    <div class="table-actions">
      <a-button type="primary" @click="handleAdd">
        <PlusOutlined /> 新增设备
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
          <a-tag :color="DeviceStatusMap[record.status]?.color">
            {{ DeviceStatusMap[record.status]?.text }}
          </a-tag>
        </template>
        <template v-if="column.key === 'createTime'">
          {{ formatDateTime(record.createTime) }}
        </template>
        <template v-if="column.key === 'action'">
          <a-space>
            <a-button type="link" size="small" @click="handleView(record)">
              <EyeOutlined /> 查看
            </a-button>
            <a-button type="link" size="small" @click="handleEdit(record)">
              <EditOutlined /> 编辑
            </a-button>
            <a-popconfirm
              title="确定要删除该设备吗？"
              ok-text="确定"
              cancel-text="取消"
              @confirm="handleDelete(record)"
            >
              <a-button type="link" size="small" danger>
                <DeleteOutlined /> 删除
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 新增/编辑弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
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
        <a-form-item label="设备编号" name="code">
          <a-input v-model:value="formState.code" placeholder="请输入设备编号" />
        </a-form-item>
        <a-form-item label="设备名称" name="name">
          <a-input v-model:value="formState.name" placeholder="请输入设备名称" />
        </a-form-item>
        <a-form-item label="设备型号" name="model">
          <a-input v-model:value="formState.model" placeholder="请输入设备型号" />
        </a-form-item>
        <a-form-item label="设备类型" name="type">
          <a-select v-model:value="formState.type" placeholder="请选择设备类型">
            <a-select-option value="空调">空调</a-select-option>
            <a-select-option value="电梯">电梯</a-select-option>
            <a-select-option value="消防设备">消防设备</a-select-option>
            <a-select-option value="配电设备">配电设备</a-select-option>
            <a-select-option value="给排水设备">给排水设备</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="安装位置" name="location">
          <a-input v-model:value="formState.location" placeholder="请输入安装位置" />
        </a-form-item>
        <a-form-item label="设备状态" name="status">
          <a-select v-model:value="formState.status" placeholder="请选择状态">
            <a-select-option :value="1">正常</a-select-option>
            <a-select-option :value="2">维修中</a-select-option>
            <a-select-option :value="3">停用</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import { getDeviceList, createDevice, updateDevice, deleteDevice } from '@/api'
import { formatDateTime } from '@/utils/date'
import { DeviceStatusMap } from '@/types/api.d.ts'
import type { Device } from '@/types/api.d.ts'

const router = useRouter()

// 搜索表单
const searchForm = reactive({
  name: '',
  type: undefined as string | undefined,
  status: undefined as number | undefined
})

// 表格
const loading = ref(false)
const tableData = ref<Device[]>([])
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
})

const columns = [
  { title: '设备编号', dataIndex: 'code', key: 'code', width: 120 },
  { title: '设备名称', dataIndex: 'name', key: 'name', width: 180 },
  { title: '设备型号', dataIndex: 'model', key: 'model', width: 120 },
  { title: '设备类型', dataIndex: 'type', key: 'type', width: 100 },
  { title: '安装位置', dataIndex: 'location', key: 'location', width: 150 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80 },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 160 },
  { title: '操作', key: 'action', width: 200, fixed: 'right' as const }
]

// 弹窗
const modalVisible = ref(false)
const modalLoading = ref(false)
const modalTitle = ref('新增设备')
const formRef = ref()
const editingId = ref<number | null>(null)

const formState = reactive({
  code: '',
  name: '',
  model: '',
  type: undefined as string | undefined,
  location: '',
  status: 1
})

const formRules = {
  code: [{ required: true, message: '请输入设备编号' }],
  name: [{ required: true, message: '请输入设备名称' }],
  type: [{ required: true, message: '请选择设备类型' }],
  location: [{ required: true, message: '请输入安装位置' }]
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await getDeviceList({
      page: pagination.current - 1,
      size: pagination.pageSize,
      ...searchForm
    })
    tableData.value = res.content
    pagination.total = res.totalElements
  } catch (error) {
    console.error('Failed to load devices:', error)
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
  searchForm.type = undefined
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
  modalTitle.value = '新增设备'
  editingId.value = null
  Object.assign(formState, {
    code: '',
    name: '',
    model: '',
    type: undefined,
    location: '',
    status: 1
  })
  modalVisible.value = true
}

// 查看
const handleView = (record: Device) => {
  router.push(`/device/detail/${record.id}`)
}

// 编辑
const handleEdit = (record: Device) => {
  modalTitle.value = '编辑设备'
  editingId.value = record.id
  Object.assign(formState, {
    code: record.code,
    name: record.name,
    model: record.model,
    type: record.type,
    location: record.location,
    status: record.status
  })
  modalVisible.value = true
}

// 删除
const handleDelete = async (record: Device) => {
  try {
    await deleteDevice(record.id)
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

    if (editingId.value) {
      await updateDevice(editingId.value, formState)
      message.success('更新成功')
    } else {
      await createDevice(formState)
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

onMounted(() => {
  loadData()
})
</script>

<style lang="less" scoped>
.device-list-page {
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