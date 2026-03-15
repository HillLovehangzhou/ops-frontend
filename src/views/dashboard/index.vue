<template>
  <div class="dashboard-page">
    <!-- 统计卡片 -->
    <a-row :gutter="16" class="stat-cards">
      <a-col :xs="24" :sm="12" :lg="6">
        <a-card class="stat-card">
          <a-statistic title="设备总数" :value="stats.deviceTotal">
            <template #prefix>
              <DesktopOutlined style="color: #1890ff" />
            </template>
          </a-statistic>
          <div class="stat-detail">
            <span class="success">正常 {{ stats.deviceNormal }}</span>
            <span class="warning">维修中 {{ stats.deviceRepair }}</span>
            <span>停用 {{ stats.deviceStopped }}</span>
          </div>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :lg="6">
        <a-card class="stat-card">
          <a-statistic title="今日巡检" :value="stats.todayInspection">
            <template #prefix>
              <AuditOutlined style="color: #52c41a" />
            </template>
          </a-statistic>
          <div class="stat-detail">
            <span>待执行 {{ stats.pendingInspection }}</span>
            <span class="success">已完成 {{ stats.completedInspection }}</span>
            <span class="error">超期 {{ stats.overdueInspection }}</span>
          </div>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :lg="6">
        <a-card class="stat-card">
          <a-statistic title="待处理工单" :value="stats.pendingOrder">
            <template #prefix>
              <ToolOutlined style="color: #faad14" />
            </template>
          </a-statistic>
          <div class="stat-detail">
            <span class="warning">处理中 {{ stats.processingOrder }}</span>
            <span class="success">已完成 {{ stats.completedOrder }}</span>
          </div>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :lg="6">
        <a-card class="stat-card">
          <a-statistic title="系统运行天数" :value="runningDays">
            <template #prefix>
              <ClockCircleOutlined style="color: #722ed1" />
            </template>
          </a-statistic>
          <div class="stat-detail">
            <span>系统运行正常</span>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 图表区域 -->
    <a-row :gutter="16" class="chart-row">
      <a-col :xs="24" :lg="12">
        <a-card title="设备状态分布" class="chart-card">
          <div ref="deviceChartRef" class="chart-container"></div>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="12">
        <a-card title="工单趋势（近7天）" class="chart-card">
          <div ref="orderChartRef" class="chart-container"></div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 快捷操作 -->
    <a-row :gutter="16" class="quick-actions">
      <a-col :span="24">
        <a-card title="快捷操作">
          <a-space :size="16">
            <a-button type="primary" @click="$router.push('/device/list')">
              <DesktopOutlined /> 设备管理
            </a-button>
            <a-button @click="$router.push('/inspection/task')">
              <AuditOutlined /> 巡检任务
            </a-button>
            <a-button @click="$router.push('/work-order/list')">
              <ToolOutlined /> 工单管理
            </a-button>
          </a-space>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import {
  DesktopOutlined,
  AuditOutlined,
  ToolOutlined,
  ClockCircleOutlined
} from '@ant-design/icons-vue'
import * as echarts from 'echarts'
import { getDashboardStats, getDeviceStatusChart, getWorkOrderTrend } from '@/api'
import type { DashboardStats, ChartData } from '@/types/api.d.ts'

// 统计数据
const stats = ref<DashboardStats>({
  deviceTotal: 0,
  deviceNormal: 0,
  deviceRepair: 0,
  deviceStopped: 0,
  todayInspection: 0,
  pendingInspection: 0,
  completedInspection: 0,
  overdueInspection: 0,
  pendingOrder: 0,
  processingOrder: 0,
  completedOrder: 0
})

// 运行天数
const runningDays = ref(365)

// 图表引用
const deviceChartRef = ref<HTMLElement>()
const orderChartRef = ref<HTMLElement>()
let deviceChart: echarts.ECharts | null = null
let orderChart: echarts.ECharts | null = null

// 初始化设备状态图表
const initDeviceChart = (data: ChartData[]) => {
  if (!deviceChartRef.value) return

  deviceChart = echarts.init(deviceChartRef.value)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      bottom: 0,
      left: 'center'
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}: {c}'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        data: data.map((item, index) => ({
          ...item,
          itemStyle: {
            color: ['#52c41a', '#faad14', '#d9d9d9'][index] || '#1890ff'
          }
        }))
      }
    ]
  }
  deviceChart.setOption(option)
}

// 初始化工单趋势图表
const initOrderChart = (data: ChartData[]) => {
  if (!orderChartRef.value) return

  orderChart = echarts.init(orderChartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.map(item => item.name)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '工单数',
        type: 'line',
        smooth: true,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
            { offset: 1, color: 'rgba(24, 144, 255, 0.05)' }
          ])
        },
        lineStyle: {
          color: '#1890ff',
          width: 2
        },
        itemStyle: {
          color: '#1890ff'
        },
        data: data.map(item => item.value)
      }
    ]
  }
  orderChart.setOption(option)
}

// 加载数据
const loadData = async () => {
  try {
    const [statsData, deviceData, orderData] = await Promise.all([
      getDashboardStats(),
      getDeviceStatusChart(),
      getWorkOrderTrend(7)
    ])
    stats.value = statsData
    initDeviceChart(deviceData)
    initOrderChart(orderData)
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
  }
}

// 窗口大小变化时重绘图表
const handleResize = () => {
  deviceChart?.resize()
  orderChart?.resize()
}

onMounted(() => {
  loadData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  deviceChart?.dispose()
  orderChart?.dispose()
})
</script>

<style lang="less" scoped>
.dashboard-page {
  .stat-cards {
    margin-bottom: 16px;
  }

  .stat-card {
    .stat-detail {
      margin-top: 8px;
      font-size: 12px;
      color: @text-color-secondary;

      span {
        margin-right: 12px;

        &.success {
          color: @success-color;
        }
        &.warning {
          color: @warning-color;
        }
        &.error {
          color: @error-color;
        }
      }
    }
  }

  .chart-row {
    margin-bottom: 16px;
  }

  .chart-card {
    .chart-container {
      height: 300px;
    }
  }

  .quick-actions {
    margin-bottom: 16px;
  }
}
</style>