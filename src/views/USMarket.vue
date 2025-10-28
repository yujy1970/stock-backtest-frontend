<template>
  <div class="us-market">
    <FileUpload />
    
    <div class="chart-card">
      <div class="chart-header">
        <h2>美国股票市场 - 指数走势与资金曲线</h2>
        <button @click="refreshData" :disabled="marketStore.loading">
          {{ marketStore.loading ? '加载中...' : '刷新数据' }}
        </button>
      </div>
      
      <MarketChart 
        :data="chartData" 
        :loading="marketStore.loading" 
      />
    </div>

    <!-- 数据统计面板 -->
    <div class="stats-panel" v-if="chartData.indices && chartData.indices.length > 0">
      <h3>美国市场指数统计</h3>
      <div class="stats-grid">
        <div class="stat-item" v-for="index in chartData.indices" :key="index.name">
          <h4>{{ index.name }}</h4>
          <div class="stat-value">
            {{ getCurrentPrice(index) }}
          </div>
          <div class="stat-change">
            {{ getPriceChange(index) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useMarketStore } from '@/stores/marketStore'
import FileUpload from '@/components/FileUpload.vue'
import MarketChart from '@/components/MarketChart.vue'

const marketStore = useMarketStore()

// 计算图表数据
const chartData = computed(() => {
  return marketStore.chartData['us'] || {}
})

// 获取当前价格
const getCurrentPrice = (index: any) => {
  if (!index.data || index.data.length === 0) return '--'
  const latestData = index.data[index.data.length - 1]
  return latestData[2].toFixed(2) // close price
}

// 获取价格变化
const getPriceChange = (index: any) => {
  if (!index.data || index.data.length < 2) return '--'
  const latestData = index.data[index.data.length - 1]
  const prevData = index.data[index.data.length - 2]
  const change = latestData[2] - prevData[2] // close price change
  const changePercent = (change / prevData[2]) * 100
  return {
    value: change.toFixed(2),
    percent: changePercent.toFixed(2),
    isPositive: change >= 0
  }
}

// 刷新数据
const refreshData = async () => {
  try {
    await marketStore.fetchChartData('us')
  } catch (error) {
    console.error('刷新数据失败:', error)
    alert('刷新数据失败，请检查后端服务是否启动')
  }
}

// 页面加载时获取数据
onMounted(() => {
  if (!chartData.value.indices) {
    refreshData()
  }
})
</script>

<style scoped>
.us-market {
  padding: 20px;
}

.chart-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  background: white;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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
  font-size: 1.5rem;
}

.chart-header button {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.chart-header button:hover:not(:disabled) {
  background: #0056b3;
}

.chart-header button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 统计面板样式 */
.stats-panel {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stats-panel h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.3rem;
  border-bottom: 2px solid #007bff;
  padding-bottom: 10px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #007bff;
}

.stat-item h4 {
  margin: 0 0 10px 0;
  color: #495057;
  font-size: 1rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #212529;
  margin-bottom: 5px;
}

.stat-change {
  font-size: 0.9rem;
  font-weight: 500;
}

.stat-change.positive {
  color: #28a745;
}

.stat-change.negative {
  color: #dc3545;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .us-market {
    padding: 10px;
  }
  
  .chart-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .chart-header h2 {
    font-size: 1.3rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

/* 加载状态 */
.loading-state {
  text-align: center;
  padding: 40px;
  color: #6c757d;
}

.loading-state .spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 2s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>