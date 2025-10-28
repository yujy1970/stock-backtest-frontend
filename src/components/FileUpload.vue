<template>
  <div class="upload-card">
    <h3>数据文件上传</h3>
    
    <div class="upload-form">
      <div class="form-item">
        <label>选择市场:</label>
        <select v-model="uploadForm.market">
          <option value="cn">中国A股</option>
          <option value="us">美国股市</option>
          <option value="hk">香港股市</option>
        </select>
      </div>
      
      <div class="form-item">
        <label>文件类型:</label>
        <select v-model="uploadForm.fileType">
          <template v-if="uploadForm.market === 'cn'">
            <option value="sh000001">上证指数</option>
            <option value="sh000300">沪深300</option>
            <option value="sz399006">创业板指</option>
          </template>
          <template v-else-if="uploadForm.market === 'us'">
            <option value="dji">道琼斯指数</option>
            <option value="nasdaq">纳斯达克指数</option>
            <option value="sp500">标普500指数</option>
          </template>
          <template v-else-if="uploadForm.market === 'hk'">
            <option value="hsi">恒生指数</option>
            <option value="hkah">AH联动指数</option>
          </template>
          <option value="moneygrow">资金增长曲线</option>
        </select>
      </div>
      
      <div class="form-item">
        <label>选择文件:</label>
        <input type="file" @change="handleFileChange" accept=".csv,.txt">
        <span class="file-name">{{ uploadForm.file?.name || '未选择文件' }}</span>
      </div>
      
      <button @click="handleUpload" :disabled="!uploadForm.file || uploading">
        {{ uploading ? '上传中...' : '开始上传' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useMarketStore } from '@/stores/marketStore'

const marketStore = useMarketStore()
const uploading = ref(false)

interface UploadForm {
  market: string
  fileType: string
  file: File | null
}

const uploadForm = reactive<UploadForm>({
  market: 'cn',
  fileType: 'sh000001',
  file: null
})

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    uploadForm.file = target.files[0]
  }
}

const handleUpload = async () => {
  if (!uploadForm.file) {
    alert('请先选择文件')
    return
  }

  uploading.value = true
  
  try {
    await marketStore.uploadFile(
      uploadForm.market,
      uploadForm.fileType,
      uploadForm.file
    )
    
    alert('文件上传成功')
    uploadForm.file = null
    // 清空文件输入
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  } catch (error) {
    alert('文件上传失败: ' + error)
  } finally {
    uploading.value = false
  }
}
</script>

<style scoped>
.upload-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  background: #f9f9f9;
}

.upload-card h3 {
  margin-top: 0;
  color: #333;
}

.upload-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.form-item label {
  width: 80px;
  font-weight: bold;
}

.form-item select,
.form-item input[type="file"] {
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.file-name {
  color: #666;
  font-size: 14px;
}

button {
  padding: 10px 20px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background: #218838;
}
</style>