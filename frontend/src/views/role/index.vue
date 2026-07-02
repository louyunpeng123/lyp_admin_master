<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getRoles, getPermissions, createRole, updateRole, deleteRole } from '../../api/role'
import type { RoleItem } from '../../types/api'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()
const loading = ref(false)
const tableData = ref<RoleItem[]>([])
const allPermissions = ref<string[]>([])
const dialogVisible = ref(false)
const editingId = ref('')
const form = ref({
  name: '',
  code: '',
  description: '',
  permissions: [] as string[],
})

const permissionLabels: Record<string, string> = {
  'dashboard:view': '查看仪表盘',
  'user:read': '查看用户',
  'user:write': '管理用户',
  'role:read': '查看角色',
  'role:write': '管理角色',
  'menu:read': '查看菜单',
  'menu:write': '管理菜单',
  'settings:read': '查看设置',
  'settings:write': '修改设置',
  'log:read': '查看操作日志',
}

function canWrite() {
  return authStore.hasPermission('role:write')
}

async function loadData() {
  loading.value = true
  try {
    const [rolesRes, permRes] = await Promise.all([getRoles(), getPermissions()])
    tableData.value = rolesRes.data
    allPermissions.value = permRes.data
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingId.value = ''
  form.value = { name: '', code: '', description: '', permissions: [] }
  dialogVisible.value = true
}

function openEdit(row: RoleItem) {
  editingId.value = row.id
  form.value = {
    name: row.name,
    code: row.code,
    description: row.description,
    permissions: [...row.permissions],
  }
  dialogVisible.value = true
}

async function handleSubmit() {
  if (!form.value.name || !form.value.code) {
    ElMessage.warning('请填写角色名称和编码')
    return
  }

  if (editingId.value) {
    await updateRole(editingId.value, {
      name: form.value.name,
      description: form.value.description,
      permissions: form.value.permissions,
    })
    ElMessage.success('角色已更新')
  } else {
    await createRole(form.value)
    ElMessage.success('角色已创建')
  }

  dialogVisible.value = false
  loadData()
}

async function handleDelete(row: RoleItem) {
  await ElMessageBox.confirm(`确定删除角色「${row.name}」吗？`, '提示', { type: 'warning' })
  await deleteRole(row.id)
  ElMessage.success('角色已删除')
  loadData()
}

onMounted(loadData)
</script>

<template>
  <el-card shadow="never">
    <template #header>
      <div class="card-header">
        <span>角色管理</span>
        <el-button v-if="canWrite()" type="primary" @click="openCreate">新增角色</el-button>
      </div>
    </template>

    <el-table v-loading="loading" :data="tableData" stripe>
      <el-table-column prop="name" label="角色名称" />
      <el-table-column prop="code" label="编码" width="120" />
      <el-table-column prop="description" label="描述" />
      <el-table-column label="权限" min-width="240">
        <template #default="{ row }">
          <el-tag
            v-for="perm in row.permissions"
            :key="perm"
            size="small"
            class="perm-tag"
          >
            {{ permissionLabels[perm] || perm }}
          </el-tag>
          <el-tag v-if="row.code === 'admin'" size="small" type="danger">全部权限</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="类型" width="100">
        <template #default="{ row }">
          <el-tag :type="row.isSystem ? 'info' : 'success'" size="small">
            {{ row.isSystem ? '系统' : '自定义' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column v-if="canWrite()" label="操作" width="160">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button
            v-if="!row.isSystem"
            link
            type="danger"
            @click="handleDelete(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="dialogVisible"
      :title="editingId ? '编辑角色' : '新增角色'"
      width="520px"
    >
      <el-form label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="编码">
          <el-input v-model="form.code" :disabled="!!editingId" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" />
        </el-form-item>
        <el-form-item label="权限">
          <el-checkbox-group v-model="form.permissions">
            <el-checkbox
              v-for="perm in allPermissions"
              :key="perm"
              :label="perm"
              :value="perm"
            >
              {{ permissionLabels[perm] || perm }}
            </el-checkbox>
          </el-checkbox-group>
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
}

.perm-tag {
  margin: 2px 4px 2px 0;
}
</style>
