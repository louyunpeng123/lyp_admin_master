<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { usePermissionStore } from '../../stores/permission'

defineProps<{
  collapsed: boolean
}>()

const route = useRoute()
const permissionStore = usePermissionStore()

const activeMenu = computed(() => route.path)
const menuItems = computed(() => permissionStore.getSidebarMenus())
</script>

<template>
  <div class="sidebar">
    <div class="sidebar-logo">
      <span v-if="!collapsed" class="sidebar-logo__text">后台管理系统</span>
      <span v-else class="sidebar-logo__short">Admin</span>
    </div>

    <el-menu
      :default-active="activeMenu"
      :collapse="collapsed"
      :collapse-transition="false"
      background-color="#001529"
      text-color="rgba(255, 255, 255, 0.75)"
      active-text-color="#ffffff"
      router
      class="sidebar-menu"
    >
      <template v-for="item in menuItems" :key="item.id">
        <el-sub-menu v-if="item.children?.length" :index="item.path">
          <template #title>
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.title }}</span>
          </template>
          <el-menu-item
            v-for="child in item.children"
            :key="child.id"
            :index="child.path"
          >
            <el-icon><component :is="child.icon" /></el-icon>
            <template #title>{{ child.title }}</template>
          </el-menu-item>
        </el-sub-menu>
        <el-menu-item v-else :index="item.path">
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </template>
    </el-menu>
  </div>
</template>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #001529;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.sidebar-logo__short {
  font-size: 14px;
}

.sidebar-menu {
  flex: 1;
  border-right: none;
  background-color: transparent;
  --el-menu-bg-color: #001529;
  --el-menu-text-color: rgba(255, 255, 255, 0.75);
  --el-menu-hover-text-color: #ffffff;
  --el-menu-active-color: #ffffff;
  --el-menu-hover-bg-color: rgba(255, 255, 255, 0.08);
  --el-menu-item-height: 48px;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 220px;
}

.sidebar-menu :deep(.el-menu-item),
.sidebar-menu :deep(.el-sub-menu__title) {
  color: rgba(255, 255, 255, 0.75);
}

.sidebar-menu :deep(.el-menu-item:hover),
.sidebar-menu :deep(.el-sub-menu__title:hover) {
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.08);
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  color: #ffffff;
  background-color: #1677ff;
}

.sidebar-menu :deep(.el-icon) {
  color: inherit;
}
</style>
