<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getOperationLogs } from '../../api/log'
import type { OperationLogItem } from '../../types/api'

const loading = ref(false)
const tableData = ref<OperationLogItem[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

const keyword = ref('')
const moduleFilter = ref('')
const actionFilter = ref('')
const statusFilter = ref('')
const dateRange = ref<[string, string] | null>(null)

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

function formatDetail(detail: unknown) {
  if (detail === null || detail === undefined) return '-'
  if (typeof detail === 'string') return detail
  try {
    return JSON.stringify(detail, null, 2)
  } catch {
    return String(detail)
  }
}

async function loadData() {
  loading.value = true
  try {
    const res = await getOperationLogs({
      keyword: keyword.value || undefined,
      module: moduleFilter.value || undefined,
      action: actionFilter.value || undefined,
      status: statusFilter.value || undefined,
      startDate: dateRange.value?.[0],
      endDate: dateRange.value?.[1],
      page: page.value,
      pageSize: pageSize.value,
    })
    tableData.value = res.data.list
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  page.value = 1
  loadData()
}

function handleReset() {
  keyword.value = ''
  moduleFilter.value = ''
  actionFilter.value = ''
  statusFilter.value = ''
  dateRange.value = null
  page.value = 1
  loadData()
}

onMounted(loadData)
</script>

<template>
  <el-card shadow="never">
    <template #header>
      <div class="card-header">
        <span>操作日志</span>
        <div class="header-actions">
          <el-input
            v-model="keyword"
            placeholder="操作人/对象/路径"
            clearable
            style="width: 180px"
            @keyup.enter="handleSearch"
          />
          <el-select v-model="moduleFilter" placeholder="模块" clearable style="width: 110px">
            <el-option label="认证" value="auth" />
            <el-option label="用户" value="user" />
            <el-option label="角色" value="role" />
            <el-option label="菜单" value="menu" />
            <el-option label="配置" value="config" />
          </el-select>
          <el-select v-model="actionFilter" placeholder="动作" clearable style="width: 100px">
            <el-option label="登录" value="login" />
            <el-option label="创建" value="create" />
            <el-option label="更新" value="update" />
            <el-option label="删除" value="delete" />
          </el-select>
          <el-select v-model="statusFilter" placeholder="状态" clearable style="width: 100px">
            <el-option label="成功" value="success" />
            <el-option label="失败" value="fail" />
          </el-select>
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 260px"
          />
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>
      </div>
    </template>

    <el-table v-loading="loading" :data="tableData" stripe>
      <el-table-column type="expand">
        <template #default="{ row }">
          <div class="detail-panel">
            <p><strong>请求路径：</strong>{{ row.path || '-' }}</p>
            <p><strong>HTTP 方法：</strong>{{ row.method || '-' }}</p>
            <p><strong>对象 ID：</strong>{{ row.targetId || '-' }}</p>
            <p><strong>详情：</strong></p>
            <pre class="detail-json">{{ formatDetail(row.detail) }}</pre>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="operatorName" label="操作人" width="120" />
      <el-table-column label="模块" width="90">
        <template #default="{ row }">
          <el-tag size="small">{{ moduleLabels[row.module] || row.module }}</el-tag>
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
      <el-table-column prop="ip" label="IP" width="130" show-overflow-tooltip />
      <el-table-column label="时间" width="180">
        <template #default="{ row }">
          {{ new Date(row.createdAt).toLocaleString('zh-CN') }}
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @current-change="loadData"
        @size-change="handleSearch"
      />
    </div>
  </el-card>
</template>

<style scoped>
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.detail-panel {
  padding: 8px 16px 8px 48px;
  line-height: 1.8;
}

.detail-json {
  margin: 4px 0 0;
  padding: 12px;
  background: var(--el-fill-color-light);
  border-radius: 4px;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 240px;
  overflow: auto;
}
</style>
