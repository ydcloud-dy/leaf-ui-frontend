<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useHeartbeat } from '@/composables/useHeartbeat'
import { useVisitTracking } from '@/composables/useVisitTracking'

const userStore = useUserStore()

// 启动心跳服务（保持在线状态）
useHeartbeat()

// 启动访问追踪服务（内部已自动监听路由变化）
useVisitTracking()

onMounted(() => {
  // 尝试从本地存储恢复用户信息
  userStore.initUser()
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 18px; /* 设置基础字体大小为18px，默认是16px */
}

body {
  font-family: "Arial Rounded MT Bold", "Arial", sans-serif;
  background-color: #f5f7fa;
  font-size: 18px; /* 基础字体大小 */
}

#app {
  min-height: 100vh;
}

.container {
  width: 70%;
  max-width: 1800px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  padding: 40px 0 20px;
  text-align: center;
}

.page-title {
  font-size: 38px; /* 从32px增加到38px */
  font-weight: 600;
  color: #303133;
  margin-bottom: 10px;
}

.page-subtitle {
  font-size: 20px; /* 从16px增加到20px */
  color: #909399;
}
</style>
