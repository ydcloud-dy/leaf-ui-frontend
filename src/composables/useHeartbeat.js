import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { sendHeartbeat as sendHeartbeatAPI } from '@/api/stats'

/**
 * 心跳服务 - 保持在线状态
 * 每 30 秒发送一次心跳，Redis 会记录在线状态
 */
export function useHeartbeat() {
  const router = useRouter()
  let heartbeatTimer = null

  // 发送心跳请求
  const sendHeartbeat = async () => {
    try {
      // 获取当前页面路径
      const currentPath = router.currentRoute.value.path
      await sendHeartbeatAPI({ path: currentPath })
    } catch (error) {
      console.warn('Heartbeat failed:', error)
    }
  }

  // 启动心跳
  const startHeartbeat = () => {
    // 立即发送一次
    sendHeartbeat()

    // 每 30 秒发送一次
    heartbeatTimer = setInterval(() => {
      sendHeartbeat()
    }, 30000) // 30 秒
  }

  // 停止心跳
  const stopHeartbeat = () => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }
  }

  // 自动管理生命周期
  onMounted(() => {
    startHeartbeat()
  })

  onUnmounted(() => {
    stopHeartbeat()
  })

  return {
    startHeartbeat,
    stopHeartbeat
  }
}
