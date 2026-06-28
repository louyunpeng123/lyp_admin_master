<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from '../components/layout/AppHeader.vue'
import AppSidebar from '../components/layout/AppSidebar.vue'

const collapsed = ref(false)

function toggleCollapse() {
  collapsed.value = !collapsed.value
}
</script>

<template>
  <el-container class="admin-layout">
    <el-aside :width="collapsed ? '64px' : '220px'" class="admin-aside">
      <AppSidebar :collapsed="collapsed" />
    </el-aside>

    <el-container class="admin-main">
      <el-header class="admin-header">
        <AppHeader :collapsed="collapsed" @toggle-collapse="toggleCollapse" />
      </el-header>

      <el-main class="admin-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.admin-layout {
  min-height: 100vh;
}

.admin-aside {
  overflow: hidden;
  transition: width 0.2s;
}

.admin-main {
  background-color: #f0f2f5;
}

.admin-header {
  height: 60px;
  padding: 0;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
}

.admin-content {
  padding: 20px;
}
</style>
