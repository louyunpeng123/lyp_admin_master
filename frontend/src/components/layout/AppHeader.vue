<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Expand, Fold, UserFilled } from '@element-plus/icons-vue'
import { useAuthStore } from '../../stores/auth'
import { usePermissionStore } from '../../stores/permission'

defineProps<{
  collapsed: boolean
}>()

const emit = defineEmits<{
  toggleCollapse: []
}>()

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const permissionStore = usePermissionStore()

const pageTitle = computed(() => (route.meta.title as string) || '后台管理系统')
const displayName = computed(() => authStore.user?.nickname || authStore.user?.username || '用户')
const roleName = computed(() => authStore.user?.role?.name || '')

function goProfile() {
  router.push('/profile')
}

function handleLogout() {
  authStore.logout()
  permissionStore.reset(router)
  router.push('/login')
}
</script>

<template>
  <div class="header">
    <div class="header-left">
      <el-button text @click="emit('toggleCollapse')">
        <el-icon :size="20">
          <Fold v-if="!collapsed" />
          <Expand v-else />
        </el-icon>
      </el-button>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>首页</el-breadcrumb-item>
        <el-breadcrumb-item>{{ pageTitle }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="header-right">
      <el-tag v-if="roleName" size="small" type="info" class="role-tag">{{ roleName }}</el-tag>
      <el-dropdown trigger="click">
        <span class="user-info">
          <el-avatar :size="32" :icon="UserFilled" />
          <span class="user-name">{{ displayName }}</span>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="goProfile">个人中心</el-dropdown-item>
            <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.user-name {
  font-size: 14px;
  color: #303133;
}

.role-tag {
  margin-right: 4px;
}
</style>
