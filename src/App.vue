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
