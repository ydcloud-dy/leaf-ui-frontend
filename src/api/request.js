import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

// 创建 axios 实例
const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    const userStore = useUserStore()

    // 添加 token
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }

    return config
  },
  error => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const res = response.data

    // 后端统一返回格式：{ code: 0, message: "success", data: {...} }
    // code 为 0 表示成功，其他值表示失败
    if (res.code === 0) {
      return res
    }

    // 处理业务错误
    const errorMsg = res.message || '请求失败'

    // 只处理需要特殊处理的错误码
    if (res.code === 401) {
      ElMessage.error('未授权，请登录')
      const userStore = useUserStore()
      userStore.logout()
      window.location.href = '/login'
    }
    // 其他错误不在拦截器中显示，让业务代码处理

    // 将完整的响应数据传递给 catch
    const error = new Error(errorMsg)
    error.code = res.code
    error.response = { data: res }
    return Promise.reject(error)
  },
  error => {
    console.error('Response error:', error)

    // HTTP 状态码错误
    if (error.response) {
      const { status, data } = error.response
      const errorMsg = data?.message || '请求失败'

      if (status === 401) {
        ElMessage.error('未授权，请登录')
        const userStore = useUserStore()
        userStore.logout()
        window.location.href = '/login'
      }
      // 其他 HTTP 错误不在拦截器中显示，让业务代码处理

      // 确保错误对象包含后端返回的消息
      error.message = errorMsg
    } else if (error.request) {
      // 网络错误才在拦截器中显示
      ElMessage.error('网络错误，请检查网络连接')
      error.message = '网络错误，请检查网络连接'
    } else {
      error.message = '请求配置错误'
    }

    return Promise.reject(error)
  }
)

export default request
