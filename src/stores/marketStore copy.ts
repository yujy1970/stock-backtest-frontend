import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { marketAPI } from '@/services/api'

export const useMarketStore = defineStore('market', () => {
  // 状态
  const currentMarket = ref('cn')
  const chartData = ref({})
  const loading = ref(false)
  const uploadProgress = ref(0)
  
  // Getter
  const marketTitle = computed(() => {
    const titles = {
      cn: '中国A股市场',
      us: '美国股票市场', 
      hk: '香港股票市场'
    }
    return titles[currentMarket.value] || '股票市场'
  })
  
  // Actions
  const setCurrentMarket = (market: string) => {
    currentMarket.value = market
  }
  
  const fetchChartData = async (market: string) => {
    loading.value = true
    try {
      const data = await marketAPI.getChartData(market)
      chartData.value[market] = data
      return data
    } catch (error) {
      console.error('Failed to fetch chart data:', error)
      throw error
    } finally {
      loading.value = false
    }
  }
  
  const uploadFile = async (market: string, fileType: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    
    uploadProgress.value = 0
    
    try {
      const result = await marketAPI.uploadFile(market, fileType, formData)
      
      // 上传成功后刷新数据
      await fetchChartData(market)
      return result
    } catch (error) {
      console.error('File upload failed:', error)
      throw error
    } finally {
      uploadProgress.value = 0
    }
  }
  
  return {
    // State
    currentMarket,
    chartData,
    loading,
    uploadProgress,
    
    // Getters
    marketTitle,
    
    // Actions
    setCurrentMarket,
    fetchChartData,
    uploadFile
  }
})