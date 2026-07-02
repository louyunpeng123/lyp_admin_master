<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { User, UserFilled, Document, Warning } from '@element-plus/icons-vue'
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
  operationLogCount: 0,
  todayOperations: 0,
  todayLoginFails: 0,
  recentLogs: [],
})

const moduleLabels: Record<string, string> = {
  auth: '认证',
  user: '用户',
  role: '角色',
  menu: '菜单',
  config: '配置',
}

const actionLabels: Record<string, string> = {
  login: '登录',
  create: '创建',
  update: '更新',
  delete: '删除',
}

function canViewLogs() {
  return authStore.hasPermission('log:read')
}

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
            <el-icon :size="40" color="#67c23a"><Document /></el-icon>
            <div>
              <div class="stat-card__value">{{ stats.todayOperations }}</div>
              <div class="stat-card__label">今日操作</div>
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
            <el-icon :size="40" color="#f56c6c"><Warning /></el-icon>
            <div>
              <div class="stat-card__value">{{ stats.todayLoginFails }}</div>
              <div class="stat-card__label">今日登录失败</div>
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
        。系统已启用 JWT 认证、RBAC 权限控制和动态路由；关键操作会自动写入审计日志，可在操作日志页按模块、动作、状态和时间筛选查询。
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
            <router-link v-if="canViewLogs()" to="/logs">操作日志</router-link>
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
            <li>菜单数量：{{ stats.menuCount }}</li>
            <li>操作日志总数：{{ stats.operationLogCount }}</li>
            <li>权限模型：RBAC（基于角色的访问控制）</li>
            <li>路由模式：后端菜单驱动动态路由</li>
            <li>认证方式：JWT Bearer Token</li>
            <li>操作审计：自动记录登录、注册、增删改及失败操作</li>
            <li>日志查询：支持关键词、模块、动作、状态、日期范围筛选</li>
          </ul>
        </el-card>
      </el-col>
    </el-row>

    <el-card v-if="canViewLogs()" shadow="never">
      <template #header>
        <div class="recent-header">
          <span>最近操作</span>
          <router-link to="/logs" class="recent-link">查看全部</router-link>
        </div>
      </template>
      <el-table :data="stats.recentLogs" stripe empty-text="暂无操作记录">
        <el-table-column prop="operatorName" label="操作人" width="120" />
        <el-table-column label="模块" width="90">
          <template #default="{ row }">
            {{ moduleLabels[row.module] || row.module }}
          </template>
        </el-table-column>
        <el-table-column label="动作" width="90">
          <template #default="{ row }">
            {{ actionLabels[row.action] || row.action }}
          </template>
        </el-table-column>
        <el-table-column prop="targetName" label="操作对象" min-width="120" show-overflow-tooltip />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'success' ? 'success' : 'danger'" size="small">
              {{ row.status === 'success' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="时间" width="180">
          <template #default="{ row }">
            {{ new Date(row.createdAt).toLocaleString('zh-CN') }}
          </template>
        </el-table-column>
      </el-table>
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

.recent-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.recent-link {
  font-size: 14px;
  color: #409eff;
  text-decoration: none;
}
</style>
