<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { User, UserFilled, Menu as MenuIcon, TrendCharts } from '@element-plus/icons-vue'
import { getDashboardStats } from '../../api/config'
import type { DashboardStats } from '../../types/api'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()
const loading = ref(false)
const stats = ref<DashboardStats>({
  userCount: 0,
  roleCount: 0,
  menuCount: 0,
  activeUsers: 0,
  todayVisits: 0,
})

onMounted(async () => {
  loading.value = true
  try {
    const res = await getDashboardStats()
    stats.value = res.data
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div v-loading="loading" class="page">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <el-icon :size="40" color="#409eff"><User /></el-icon>
            <div>
              <div class="stat-card__value">{{ stats.userCount }}</div>
              <div class="stat-card__label">用户总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <el-icon :size="40" color="#67c23a"><TrendCharts /></el-icon>
            <div>
              <div class="stat-card__value">{{ stats.todayVisits }}</div>
              <div class="stat-card__label">今日访问</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <el-icon :size="40" color="#e6a23c"><UserFilled /></el-icon>
            <div>
              <div class="stat-card__value">{{ stats.activeUsers }}</div>
              <div class="stat-card__label">活跃用户</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <el-icon :size="40" color="#f56c6c"><MenuIcon /></el-icon>
            <div>
              <div class="stat-card__value">{{ stats.menuCount }}</div>
              <div class="stat-card__label">菜单数量</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="welcome-card" shadow="never">
      <template #header>
        <span>欢迎回来，{{ authStore.user?.nickname || authStore.user?.username }}</span>
      </template>
      <p>
        当前角色：<el-tag size="small">{{ authStore.user?.role?.name }}</el-tag>
        。系统已启用 JWT 认证、RBAC 权限控制和动态路由，侧边栏菜单会根据你的权限自动展示。
      </p>
    </el-card>

    <el-row :gutter="20">
      <el-col :xs="24" :md="12">
        <el-card shadow="never">
          <template #header><span>快捷入口</span></template>
          <div class="quick-links">
            <router-link to="/users">用户管理</router-link>
            <router-link to="/roles">角色管理</router-link>
            <router-link to="/menus">菜单管理</router-link>
            <router-link to="/settings">系统设置</router-link>
            <router-link to="/profile">个人中心</router-link>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card shadow="never">
          <template #header><span>系统概览</span></template>
          <ul class="overview-list">
            <li>角色数量：{{ stats.roleCount }}</li>
            <li>权限模型：RBAC（基于角色的访问控制）</li>
            <li>路由模式：后端菜单驱动动态路由</li>
            <li>认证方式：JWT Bearer Token</li>
          </ul>
        </el-card>
      </el-col>
    </el-row>
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

.quick-links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.quick-links a {
  padding: 8px 16px;
  color: #409eff;
  text-decoration: none;
  background: #ecf5ff;
  border-radius: 4px;
  font-size: 14px;
}

.overview-list {
  margin: 0;
  padding-left: 20px;
  line-height: 2;
  color: #606266;
}
</style>
