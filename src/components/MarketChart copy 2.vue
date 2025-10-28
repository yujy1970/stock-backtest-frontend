<template>
  <div class="market-chart">
    <div v-if="loading" class="chart-loading">图表加载中...</div>
    <div v-else-if="!hasData" class="chart-empty">📊 暂无数据，请上传数据文件或检查连接</div>
    <div v-else ref="chartRef" class="chart-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null
const chartInitialized = ref(false)

// 计算属性：检查是否有数据可显示
const hasData = computed(() => {
  if (!props.data) return false

  const { indices, moneyGrow } = props.data
  const hasIndicesData =
    indices && indices.some((index: any) => index.data && index.data.length > 0)
  const hasMoneyGrowData = moneyGrow && moneyGrow.length > 0

  return hasIndicesData || hasMoneyGrowData
})

// 初始化图表
const initChart = () => {
  if (!chartRef.value || chartInstance) return

  chartInstance = echarts.init(chartRef.value)
  chartInitialized.value = true
  console.log('图表初始化完成')

  // 立即尝试渲染（如果有数据的话）
  if (hasData.value) {
    updateChart()
  }
}

// 更新图表数据
const updateChart = () => {
  if (!chartInstance || !props.data || !hasData.value) {
    console.log('图表更新条件不满足:', {
      hasInstance: !!chartInstance,
      hasData: !!props.data,
      hasValidData: hasData.value,
    })
    return
  }

  console.log('开始更新图表数据...')
  const { indices, moneyGrow } = props.data
  const series: any[] = []
  const legends: string[] = []

  // 处理股票指数数据（K线图）
  if (indices && indices.length > 0) {
    indices.forEach((index: any) => {
      if (index.data && index.data.length > 0) {
        const klineData = index.data.map((item: any) => [
          item[1], // open
          item[2], // close
          item[3], // low
          item[4], // high
        ])

        series.push({
          name: index.name,
          type: 'candlestick',
          data: klineData,
          itemStyle: {
            color: '#ec0000',
            color0: '#00da3c',
            borderColor: '#8A0000',
            borderColor0: '#008F28',
          },
        })
        legends.push(index.name)
      }
    })
  }

  // 处理资金增长曲线
  if (moneyGrow && moneyGrow.length > 0) {
    const moneyData = moneyGrow.map((item: any) => item[1])

    series.push({
      name: '资金增长曲线',
      type: 'line',
      yAxisIndex: 1,
      data: moneyData,
      lineStyle: {
        color: '#ff9800',
        width: 3,
      },
      itemStyle: {
        color: '#ff9800',
      },
    })
    legends.push('资金增长曲线')
  }

  // 获取日期数据
  const dates =
    indices && indices.length > 0 && indices[0].data
      ? indices[0].data.map((item: any) => item[0])
      : moneyGrow
        ? moneyGrow.map((item: any) => item[0])
        : []

  const option = {
    title: {
      text: '股票指数与资金曲线',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
    },
    legend: {
      data: legends,
      top: 30,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '15%',
    },
    xAxis: {
      type: 'category',
      data: dates,
      scale: true,
      boundaryGap: false,
      axisLine: { onZero: false },
      splitLine: { show: false },
    },
    yAxis: [
      {
        type: 'value',
        scale: true,
        splitArea: { show: true },
      },
      {
        type: 'value',
        scale: true,
        gridIndex: 0,
      },
    ],
    dataZoom: [
      {
        type: 'inside',
        start: 50,
        end: 100,
      },
      {
        show: true,
        type: 'slider',
        top: '90%',
        start: 50,
        end: 100,
      },
    ],
    series: series,
  }

  console.log('设置图表配置，系列数量:', series.length)
  chartInstance.setOption(option)
}

// 监听数据变化
watch(
  () => props.data,
  (newData) => {
    console.log('图表数据发生变化，hasData:', hasData.value)
    nextTick(() => {
      if (chartInitialized.value) {
        updateChart()
      } else {
        initChart()
      }
    })
  },
  { deep: true, immediate: true },
)

// 监听加载状态变化
watch(
  () => props.loading,
  (newLoading, oldLoading) => {
    if (oldLoading && !newLoading && hasData.value) {
      // 从加载中变为加载完成，且有数据时更新图表
      console.log('加载状态变化，更新图表')
      nextTick(() => {
        updateChart()
      })
    }
  },
)

// 组件挂载
onMounted(() => {
  console.log('MarketChart 组件挂载')
  // 延迟初始化，确保DOM已渲染
  setTimeout(() => {
    initChart()
    // 如果已经有数据，立即渲染
    if (hasData.value) {
      updateChart()
    }
  }, 100)
})

// 组件卸载
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
  chartInitialized.value = false
})
</script>

<style scoped>
.market-chart {
  width: 100%;
  height: 600px;
  position: relative;
}

.chart-container {
  width: 100%;
  height: 100%;
}

.chart-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #666;
  font-size: 16px;
}

.chart-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #999;
  font-size: 16px;
  background: #f9f9f9;
  border: 2px dashed #ddd;
  border-radius: 8px;
}
</style>
