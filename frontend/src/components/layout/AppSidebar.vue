<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { menuItems } from '../../config/menu'

defineProps<{
  collapsed: boolean
}>()

const route = useRoute()

const activeMenu = computed(() => route.path)
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
      router
      class="sidebar-menu"
    >
      <el-menu-item
        v-for="item in menuItems"
        :key="item.path"
        :index="item.path"
      >
        <el-icon><component :is="item.icon" /></el-icon>
        <template #title>{{ item.title }}</template>
      </el-menu-item>
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
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 220px;
}
</style>
