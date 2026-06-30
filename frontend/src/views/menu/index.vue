<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getMenus, createMenu, updateMenu, deleteMenu } from '../../api/menu'
import type { MenuNode } from '../../types/api'
import { useAuthStore } from '../../stores/auth'
import { iconOptions } from '../../utils/icons'

const authStore = useAuthStore()
const loading = ref(false)
const tableData = ref<MenuNode[]>([])
const dialogVisible = ref(false)
const editingId = ref('')

const form = ref({
  title: '',
  path: '',
  name: '',
  component: '',
  icon: 'Menu',
  sort: 0,
  hidden: false,
  permission: '',
  type: 'menu' as 'menu' | 'button',
})

const permissionOptions = [
  { label: '无限制', value: '' },
  { label: '查看仪表盘', value: 'dashboard:view' },
  { label: '查看用户', value: 'user:read' },
  { label: '管理用户', value: 'user:write' },
  { label: '查看角色', value: 'role:read' },
  { label: '管理角色', value: 'role:write' },
  { label: '查看菜单', value: 'menu:read' },
  { label: '管理菜单', value: 'menu:write' },
  { label: '查看设置', value: 'settings:read' },
  { label: '修改设置', value: 'settings:write' },
]

function canWrite() {
  return authStore.hasPermission('menu:write')
}

async function loadData() {
  loading.value = true
  try {
    const res = await getMenus()
    tableData.value = res.data
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingId.value = ''
  form.value = {
    title: '',
    path: '',
    name: '',
    component: '',
    icon: 'Menu',
    sort: 0,
    hidden: false,
    permission: '',
    type: 'menu',
  }
  dialogVisible.value = true
}

function openEdit(row: MenuNode) {
  editingId.value = row.id
  form.value = {
    title: row.title,
    path: row.path,
    name: row.name,
    component: row.component,
    icon: row.icon,
    sort: row.sort,
    hidden: row.hidden,
    permission: row.permission,
    type: row.type,
  }
  dialogVisible.value = true
}

async function handleSubmit() {
  if (!form.value.title || !form.value.path || !form.value.name) {
    ElMessage.warning('请填写完整信息')
    return
  }

  if (editingId.value) {
    await updateMenu(editingId.value, form.value)
    ElMessage.success('菜单已更新，重新登录后路由生效')
  } else {
    await createMenu(form.value)
    ElMessage.success('菜单已创建')
  }

  dialogVisible.value = false
  loadData()
}

async function handleDelete(row: MenuNode) {
  await ElMessageBox.confirm(`确定删除菜单「${row.title}」吗？`, '提示', { type: 'warning' })
  await deleteMenu(row.id)
  ElMessage.success('菜单已删除')
  loadData()
}

onMounted(loadData)
</script>

<template>
  <el-card shadow="never">
    <template #header>
      <div class="card-header">
        <span>菜单管理</span>
        <el-button v-if="canWrite()" type="primary" @click="openCreate">新增菜单</el-button>
      </div>
    </template>

    <el-alert
      type="info"
      :closable="false"
      title="菜单变更后需重新登录以刷新动态路由"
      class="tip"
    />

    <el-table
      v-loading="loading"
      :data="tableData"
      row-key="id"
      default-expand-all
      stripe
    >
      <el-table-column prop="title" label="菜单名称" />
      <el-table-column prop="path" label="路径" />
      <el-table-column prop="name" label="路由名" />
      <el-table-column prop="component" label="组件" />
      <el-table-column prop="icon" label="图标" width="100" />
      <el-table-column prop="sort" label="排序" width="70" />
      <el-table-column label="隐藏" width="70">
        <template #default="{ row }">
          <el-tag :type="row.hidden ? 'info' : 'success'" size="small">
            {{ row.hidden ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column v-if="canWrite()" label="操作" width="160">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="dialogVisible"
      :title="editingId ? '编辑菜单' : '新增菜单'"
      width="560px"
    >
      <el-form label-width="90px">
        <el-form-item label="菜单名称">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="路径">
          <el-input v-model="form.path" placeholder="/example" />
        </el-form-item>
        <el-form-item label="路由名称">
          <el-input v-model="form.name" placeholder="ExamplePage" />
        </el-form-item>
        <el-form-item label="组件路径">
          <el-input v-model="form.component" placeholder="example/index.vue" />
        </el-form-item>
        <el-form-item label="图标">
          <el-select v-model="form.icon" filterable>
            <el-option v-for="icon in iconOptions" :key="icon" :label="icon" :value="icon" />
          </el-select>
        </el-form-item>
        <el-form-item label="权限标识">
          <el-select v-model="form.permission">
            <el-option
              v-for="opt in permissionOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" />
        </el-form-item>
        <el-form-item label="隐藏菜单">
          <el-switch v-model="form.hidden" />
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

.tip {
  margin-bottom: 16px;
}
</style>
