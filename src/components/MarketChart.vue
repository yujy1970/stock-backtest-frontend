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

/** ========== 小工具：把日期+数值映射为 ECharts 的 time 轴数据点 ========== */
// [dateArray] + [yArray] -> [[timestamp, value], ...]
function toTimePairs(xArr: Array<string | number | Date>, yArr: Array<number | null | undefined>) {
  if (!Array.isArray(xArr) || !Array.isArray(yArr)) return []
  const toTs = (d: any): number => {
    if (d instanceof Date) return d.getTime()
    if (typeof d === 'number') return d // 已是时间戳
    const t = new Date(d).getTime()
    return isNaN(t) ? Date.parse(String(d)) : t
  }
  const n = Math.max(xArr.length, yArr.length)
  const out: Array<[number, number | null]> = new Array(n)
  for (let i = 0; i < n; i++) {
    const x = xArr[i]
    const y = yArr[i] as number | null | undefined
    out[i] = [toTs(x), y == null ? null : y]
  }
  return out
}

// K 线： [date, open, close, low, high] -> [timestamp, open, close, low, high]
function toKlinePoints(rows: Array<[any, number, number, number, number]>) {
  const toTs = (d: any): number => {
    if (d instanceof Date) return d.getTime()
    if (typeof d === 'number') return d
    const t = new Date(d).getTime()
    return isNaN(t) ? Date.parse(String(d)) : t
  }
  return rows.map((r) => [toTs(r[0]), r[1], r[2], r[3], r[4]])
}

// 计算属性：检查是否有数据可显示
const hasData = computed(() => {
  if (!props.data) return false

  const { indices, moneyGrow } = props.data as any
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
    // 防御：首次可见时做一次稳定 resize，避免在标签页内初始宽高为 0
    setTimeout(() => chartInstance && chartInstance.resize(), 0)
  }
}

// 更新图表数据（最小改动：改用 time 轴与带时间戳的数据）
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
  const { indices, moneyGrow } = props.data as any
  const series: any[] = []
  const legends: string[] = []

  // ============== 处理股票指数数据（K线图，改为带时间戳） ==============
  if (indices && indices.length > 0) {
    indices.forEach((index: any) => {
      if (index.data && index.data.length > 0) {
        // index.data: [date, open, close, low, high]
        const klineDataWithTs = toKlinePoints(index.data)

        series.push({
          name: index.name,
          type: 'candlestick',
          data: klineDataWithTs, // [ts, O, C, L, H]
          encode: { x: 0, y: [1, 2, 3, 4] }, // 明确告诉 ECharts 第0列是 x 轴（时间）
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

  // ============== 处理资金增长曲线（改为 [ts, value]） ==============
  if (moneyGrow && moneyGrow.length > 0) {
    // moneyGrow 的结构：[[date, value], ...]
    const moneyDataPairs = toTimePairs(
      moneyGrow.map((it: any) => it[0]),
      moneyGrow.map((it: any) => it[1]),
    )

    series.push({
      name: '资金增长曲线',
      type: 'line',
      yAxisIndex: 1,
      data: moneyDataPairs, // [[ts, value], ...]
      showSymbol: false,
      connectNulls: false,
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

  // 以前 category 轴用到的 dates，这里不再传到 xAxis（保留仅用于调试）
  const dates =
    indices && indices.length > 0 && indices[0].data
      ? indices[0].data.map((item: any) => item[0])
      : moneyGrow
        ? moneyGrow.map((item: any) => item[0])
        : []
  console.log('样例日期（仅调试）:', dates.slice(0, 3), '...')

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
      // 对 time 轴，ECharts 会按序列的第一个维度（时间戳）统一触发
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
      containLabel: true,
    },
    // 关键改动：使用 time 轴，并且不再传 xAxis.data
    xAxis: {
      type: 'time',
      boundaryGap: false,
      scale: true,
      axisLine: { onZero: false },
      splitLine: { show: false },
      axisLabel: {
        formatter: (value: number) => {
          const d = new Date(value)
          const m = String(d.getMonth() + 1).padStart(2, '0')
          const day = String(d.getDate()).padStart(2, '0')
          return `${d.getFullYear()}-${m}-${day}`
        },
      },
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
    series,
  }

  console.log('设置图表配置，系列数量:', series.length)
  chartInstance.setOption(option, true)
}

// 监听数据变化
watch(
  () => props.data,
  () => {
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
  /* 给一个可靠的最小高度，避免父容器初始为 0 导致不出图 */
  min-height: 360px;
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
