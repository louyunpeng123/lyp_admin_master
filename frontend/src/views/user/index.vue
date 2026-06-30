<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
} from '../../api/user'
import { getRoles } from '../../api/role'
import type { RoleItem, UserItem } from '../../types/api'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()
const loading = ref(false)
const tableData = ref<UserItem[]>([])
const roles = ref<RoleItem[]>([])
const total = ref(0)
const keyword = ref('')
const page = ref(1)
const pageSize = ref(10)

const dialogVisible = ref(false)
const editingId = ref('')
const form = reactive({
  username: '',
  email: '',
  password: '',
  nickname: '',
  roleId: '',
  status: 'active' as 'active' | 'disabled',
})

function canWrite() {
  return authStore.hasPermission('user:write')
}

async function loadRoles() {
  const res = await getRoles()
  roles.value = res.data
}

async function loadData() {
  loading.value = true
  try {
    const res = await getUsers({ keyword: keyword.value, page: page.value, pageSize: pageSize.value })
    tableData.value = res.data.list
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingId.value = ''
  Object.assign(form, {
    username: '',
    email: '',
    password: '',
    nickname: '',
    roleId: roles.value[0]?.id || '',
    status: 'active',
  })
  dialogVisible.value = true
}

function openEdit(row: UserItem) {
  editingId.value = row.id
  Object.assign(form, {
    username: row.username,
    email: row.email,
    password: '',
    nickname: row.nickname,
    roleId: row.role?.id || '',
    status: row.status,
  })
  dialogVisible.value = true
}

async function handleSubmit() {
  if (!form.email || !form.roleId) {
    ElMessage.warning('请填写完整信息')
    return
  }

  if (editingId.value) {
    await updateUser(editingId.value, {
      email: form.email,
      nickname: form.nickname,
      roleId: form.roleId,
      status: form.status,
      password: form.password || undefined,
    })
    ElMessage.success('用户已更新')
  } else {
    if (!form.username || !form.password) {
      ElMessage.warning('请填写用户名和密码')
      return
    }
    await createUser(form)
    ElMessage.success('用户已创建')
  }

  dialogVisible.value = false
  loadData()
}

async function handleDelete(row: UserItem) {
  await ElMessageBox.confirm(`确定删除用户「${row.username}」吗？`, '提示', { type: 'warning' })
  await deleteUser(row.id)
  ElMessage.success('用户已删除')
  loadData()
}

async function handleToggleStatus(row: UserItem) {
  const newStatus = row.status === 'active' ? 'disabled' : 'active'
  const action = newStatus === 'disabled' ? '禁用' : '启用'
  await ElMessageBox.confirm(`确定${action}用户「${row.username}」吗？`, '提示', { type: 'warning' })
  await toggleUserStatus(row.id, newStatus)
  ElMessage.success(`已${action}`)
  loadData()
}

function handleSearch() {
  page.value = 1
  loadData()
}

onMounted(async () => {
  await loadRoles()
  loadData()
})
</script>

<template>
  <el-card shadow="never">
    <template #header>
      <div class="card-header">
        <span>用户管理</span>
        <div class="header-actions">
          <el-input
            v-model="keyword"
            placeholder="搜索用户名/邮箱/昵称"
            clearable
            style="width: 220px"
            @keyup.enter="handleSearch"
          />
          <el-button @click="handleSearch">搜索</el-button>
          <el-button v-if="canWrite()" type="primary" @click="openCreate">新增用户</el-button>
        </div>
      </div>
    </template>

    <el-table v-loading="loading" :data="tableData" stripe>
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="nickname" label="昵称" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column label="角色">
        <template #default="{ row }">
          <el-tag size="small">{{ row.role?.name || '-' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small">
            {{ row.status === 'active' ? '正常' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="上次登录" width="180">
        <template #default="{ row }">
          {{ row.lastLoginAt ? new Date(row.lastLoginAt).toLocaleString('zh-CN') : '-' }}
        </template>
      </el-table-column>
      <el-table-column v-if="canWrite()" label="操作" width="220">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link type="warning" @click="handleToggleStatus(row)">
            {{ row.status === 'active' ? '禁用' : '启用' }}
          </el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        layout="total, prev, pager, next"
        @current-change="loadData"
      />
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="editingId ? '编辑用户' : '新增用户'"
      width="480px"
    >
      <el-form label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="form.username" :disabled="!!editingId" />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="form.nickname" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" />
        </el-form-item>
        <el-form-item :label="editingId ? '新密码' : '密码'">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            :placeholder="editingId ? '留空则不修改' : ''"
          />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="form.roleId" style="width: 100%">
            <el-option
              v-for="role in roles"
              :key="role.id"
              :label="role.name"
              :value="role.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio value="active">正常</el-radio>
            <el-radio value="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
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
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
