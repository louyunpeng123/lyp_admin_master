<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getConfig, updateConfig } from '../../api/config'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()
const loading = ref(false)
const saving = ref(false)

const form = reactive({
  siteName: '后台管理系统',
  adminEmail: 'admin@example.com',
  enableNotify: true,
  allowRegister: true,
})

function canWrite() {
  return authStore.hasPermission('settings:write')
}

onMounted(async () => {
  loading.value = true
  try {
    const res = await getConfig()
    Object.assign(form, res.data)
  } finally {
    loading.value = false
  }
})

async function handleSubmit() {
  if (!canWrite()) {
    ElMessage.warning('您没有修改设置的权限')
    return
  }

  saving.value = true
  try {
    await updateConfig(form)
    ElMessage.success('设置已保存')
    document.title = form.siteName
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <el-card v-loading="loading" shadow="never">
    <template #header>
      <span>系统设置</span>
    </template>

    <el-form :model="form" label-width="120px" style="max-width: 560px">
      <el-form-item label="站点名称">
        <el-input v-model="form.siteName" :disabled="!canWrite()" />
      </el-form-item>
      <el-form-item label="管理员邮箱">
        <el-input v-model="form.adminEmail" :disabled="!canWrite()" />
      </el-form-item>
      <el-form-item label="消息通知">
        <el-switch v-model="form.enableNotify" :disabled="!canWrite()" />
      </el-form-item>
      <el-form-item label="允许注册">
        <el-switch v-model="form.allowRegister" :disabled="!canWrite()" />
        <span class="hint">关闭后新用户无法自行注册</span>
      </el-form-item>
      <el-form-item v-if="canWrite()">
        <el-button type="primary" :loading="saving" @click="handleSubmit">保存</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<style scoped>
.hint {
  margin-left: 12px;
  font-size: 13px;
  color: #909399;
}
</style>
