<script setup lang="ts">
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'

const form = reactive({
  siteName: '后台管理系统',
  adminEmail: 'admin@example.com',
  enableNotify: true,
})

function handleSubmit() {
  ElMessage.success('设置已保存')
}
</script>

<template>
  <el-card shadow="never">
    <template #header>
      <span>系统设置</span>
    </template>

    <el-form :model="form" label-width="100px" style="max-width: 520px">
      <el-form-item label="站点名称">
        <el-input v-model="form.siteName" />
      </el-form-item>
      <el-form-item label="管理员邮箱">
        <el-input v-model="form.adminEmail" />
      </el-form-item>
      <el-form-item label="消息通知">
        <el-switch v-model="form.enableNotify" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>
