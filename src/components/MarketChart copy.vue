<template>
  <div class="market-chart">
    <div v-if="loading" class="chart-loading">
      图表加载中...
    </div>
    <div v-else ref="chartRef" class="chart-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'

interface Props {
  data: any
  loading: boolean
}

const props = defineProps<Props>()

const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return
  
  chartInstance = echarts.init(chartRef.value)
  
  // 窗口调整时重绘
  window.addEventListener('resize', handleResize)
}

// 更新图表数据
const updateChart = () => {
  if (!chartInstance || !props.data) return
  
  const { indices, moneyGrow } = props.data
  const series: any[] = []
  const legends: string[] = []
  
  // 添加K线图系列
  if (indices && indices.length > 0) {
    indices.forEach((index: any) => {
      const klineData = index.data.map((item: any) => [
        item[1], // open
        item[2], // close  
        item[3], // low
        item[4]  // high
      ])
      
      series.push({
        name: index.name,
        type: 'candlestick',
        data: klineData,
        itemStyle: {
          color: '#ec0000',
          color0: '#00da3c',
          borderColor: '#8A0000',
          borderColor0: '#008F28'
        }
      })
      legends.push(index.name)
    })
  }
  
  // 添加资金增长曲线
  if (moneyGrow && moneyGrow.length > 0) {
    const moneyData = moneyGrow.map((item: any) => item[1])
    
    series.push({
      name: '资金增长曲线',
      type: 'line',
      yAxisIndex: 1,
      data: moneyData,
      lineStyle: {
        color: '#ff9800',
        width: 3
      },
      itemStyle: {
        color: '#ff9800'
      }
    })
    legends.push('资金增长曲线')
  }
  
  const dates = indices && indices.length > 0 ? 
    indices[0].data.map((item: any) => item[0]) : 
    (moneyGrow ? moneyGrow.map((item: any) => item[0]) : [])
  
  const option = {
    title: {
      text: '股票指数与资金曲线',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: legends,
      top: 30
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '15%'
    },
    xAxis: {
      type: 'category',
      data: dates,
      scale: true,
      boundaryGap: false
    },
    yAxis: [
      {
        type: 'value',
        scale: true,
        splitArea: { show: true }
      },
      {
        type: 'value',
        scale: true,
        gridIndex: 0
      }
    ],
    dataZoom: [
      {
        type: 'inside',
        start: 50,
        end: 100
      },
      {
        show: true,
        type: 'slider',
        top: '90%',
        start: 50,
        end: 100
      }
    ],
    series: series
  }
  
  chartInstance.setOption(option)
}

// 窗口调整
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

// 响应式更新
watch(() => props.data, () => {
  nextTick(() => {
    updateChart()
  })
}, { deep: true })

// 生命周期
onMounted(() => {
  initChart()
  updateChart()
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.market-chart {
  width: 100%;
  height: 600px;
}

.chart-container {
  width: 100%;
  height: 100%;
}

.chart-loading {
  padding: 20px;
  text-align: center;
}
</style>