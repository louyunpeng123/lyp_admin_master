<script setup lang="ts">
import { onMounted, ref } from 'vue'
import axios from 'axios'
import { User, Document, Setting } from '@element-plus/icons-vue'

const apiMessage = ref('')
const apiLoading = ref(false)
const apiError = ref('')

onMounted(async () => {
  apiLoading.value = true
  try {
    const { data } = await axios.get<{ message: string }>('/api/test')
    apiMessage.value = data.message
  } catch {
    apiError.value = '后端接口调用失败，请确认后端服务已启动'
  } finally {
    apiLoading.value = false
  }
})
</script>

<template>
  <div class="page">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :lg="8">
        <el-card shadow="hover">
          <div class="stat-card">
            <el-icon :size="40" color="#409eff"><User /></el-icon>
            <div>
              <div class="stat-card__value">1,280</div>
              <div class="stat-card__label">用户总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="8">
        <el-card shadow="hover">
          <div class="stat-card">
            <el-icon :size="40" color="#67c23a"><Document /></el-icon>
            <div>
              <div class="stat-card__value">356</div>
              <div class="stat-card__label">今日访问</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="8">
        <el-card shadow="hover">
          <div class="stat-card">
            <el-icon :size="40" color="#e6a23c"><Setting /></el-icon>
            <div>
              <div class="stat-card__value">12</div>
              <div class="stat-card__label">待处理任务</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="welcome-card" shadow="never">
      <template #header>
        <span>欢迎使用后台管理系统</span>
      </template>
      <p>左侧为导航菜单，顶部为工具栏，右侧为主内容区域。你可以在此基础上继续扩展业务页面。</p>
    </el-card>

    <el-card shadow="never">
      <template #header>
        <span>后端接口测试</span>
      </template>
      <div v-loading="apiLoading">
        <el-alert
          v-if="apiMessage"
          type="success"
          :title="apiMessage"
          show-icon
          :closable="false"
        />
        <el-alert
          v-else-if="apiError"
          type="error"
          :title="apiError"
          show-icon
          :closable="false"
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-card__value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.stat-card__label {
  margin-top: 4px;
  font-size: 14px;
  color: #909399;
}

.welcome-card p {
  margin: 0;
  line-height: 1.8;
  color: #606266;
}
</style>
