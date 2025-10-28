import axios from 'axios'

//const API_BASE_URL = 'http://192.168.12.12:8080'

const api = axios.create({
  baseURL: '', //API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  },
)

// 市场数据API
export const marketAPI = {
  // 获取图表数据
  getChartData: (market: string) => api.get(`/api/chart-data/${market}`),

  // 上传文件
  uploadFile: (market: string, fileType: string, formData: FormData) =>
    api.post(`/upload/${market}/${fileType}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
}

export default api
