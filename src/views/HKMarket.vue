<template>
  <div class="hk-market">
    <FileUpload />
    
    <div class="chart-card">
      <div class="chart-header">
        <h2>香港股票市场 - 指数走势与资金曲线</h2>
        <button @click="refreshData" :disabled="marketStore.loading">
          {{ marketStore.loading ? '加载中...' : '刷新数据' }}
        </button>
      </div>
      
      <MarketChart 
        :data="chartData" 
        :loading="marketStore.loading" 
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useMarketStore } from '@/stores/marketStore'
import FileUpload from '@/components/FileUpload.vue'
import MarketChart from '@/components/MarketChart.vue'

const marketStore = useMarketStore()

const chartData = computed(() => {
  return marketStore.chartData['hk'] || {}
})

const refreshData = async () => {
  try {
    await marketStore.fetchChartData('hk')
  } catch (error) {
    console.error('刷新数据失败:', error)
    alert('刷新数据失败，请检查后端服务是否启动')
  }
}

onMounted(() => {
  if (!chartData.value.indices) {
    refreshData()
  }
})
</script>

<style scoped>
.hk-market {
  padding: 20px;
}

.chart-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  background: white;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-header h2 {
  margin: 0;
  color: #333;
}

.chart-header button {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.chart-header button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>