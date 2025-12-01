import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as apiLogin, register as apiRegister } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const token = ref(null)

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const username = computed(() => user.value?.username || '')
  const avatar = computed(() => user.value?.avatar || '')

  // 初始化用户信息
  function initUser() {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (savedToken && savedUser) {
      token.value = savedToken
      try {
        user.value = JSON.parse(savedUser)
      } catch (e) {
        console.error('Failed to parse user data:', e)
        logout()
      }
    }
  }

  // 登录
  async function login(credentials) {
    try {
      const response = await apiLogin(credentials)
      // 后端返回格式：{ code: 0, message: "success", data: { token, user } }
      const { token: newToken, user: newUser } = response.data

      token.value = newToken
      user.value = newUser

      // 保存到本地存储
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(newUser))

      return { success: true }
    } catch (error) {
      console.error('Login error:', error)

      // 优先使用后端返回的错误消息
      let errorMessage = '登录失败'

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }

      return {
        success: false,
        message: errorMessage
      }
    }
  }

  // 注册
  async function register(credentials) {
    try {
      const response = await apiRegister(credentials)
      // 后端返回格式：{ code: 0, message: "success", data: { token, user } }
      const { token: newToken, user: newUser } = response.data

      token.value = newToken
      user.value = newUser

      // 保存到本地存储
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(newUser))

      return { success: true }
    } catch (error) {
      console.error('Register error:', error)

      // 优先使用后端返回的错误消息
      let errorMessage = '注册失败'

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }

      return {
        success: false,
        message: errorMessage
      }
    }
  }

  // 登出
  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // 更新用户信息
  function updateUser(newUserData) {
    user.value = { ...user.value, ...newUserData }
    localStorage.setItem('user', JSON.stringify(user.value))
  }

  return {
    user,
    token,
    isLoggedIn,
    isAdmin,
    username,
    avatar,
    initUser,
    login,
    register,
    logout,
    updateUser
  }
})
