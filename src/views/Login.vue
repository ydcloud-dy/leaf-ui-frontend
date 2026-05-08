<template>
  <div class="login-page">
    <div class="login-shell">
      <section class="login-intro">
        <el-button class="home-button" text @click="router.push('/')">
          <el-icon><ArrowLeft /></el-icon>
          返回首页
        </el-button>

        <div class="brand-lockup">
          <span class="brand-icon">
            <el-icon><Reading /></el-icon>
          </span>
          <span>个人博客</span>
        </div>

        <div class="intro-copy">
          <p class="intro-kicker">Leaf Blog</p>
          <h1>把技术积累留在可回看的地方</h1>
          <p>
            继续阅读文章、整理笔记、参与评论，把零散经验沉淀成自己的知识库。
          </p>
        </div>

        <div class="intro-metrics">
          <div>
            <strong>Articles</strong>
            <span>技术文章</span>
          </div>
          <div>
            <strong>Notes</strong>
            <span>主题笔记</span>
          </div>
          <div>
            <strong>Comments</strong>
            <span>互动讨论</span>
          </div>
        </div>
      </section>

      <section class="auth-panel">
        <div class="mobile-auth-top">
          <div class="mobile-brand">
            <el-icon><Reading /></el-icon>
            <span>个人博客</span>
          </div>
          <el-button text @click="router.push('/')">
            <el-icon><ArrowLeft /></el-icon>
            返回
          </el-button>
        </div>

        <div class="login-header">
          <p class="auth-kicker">{{ authCopy.kicker }}</p>
          <h2 class="login-title">{{ authCopy.title }}</h2>
          <p class="login-subtitle">{{ authCopy.subtitle }}</p>
        </div>

        <div class="tabs-shell">
          <el-tabs v-model="activeTab" class="login-tabs">
            <!-- 登录表单 -->
            <el-tab-pane label="登录" name="login">
              <el-form
                ref="loginFormRef"
                :model="loginForm"
                :rules="loginRules"
                label-width="0"
                class="login-form"
              >
                <el-form-item prop="username">
                  <el-input
                    v-model="loginForm.username"
                    placeholder="用户名或邮箱"
                    size="large"
                    clearable
                  >
                    <template #prefix>
                      <el-icon><User /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>

                <el-form-item prop="password">
                  <el-input
                    v-model="loginForm.password"
                    type="password"
                    placeholder="密码"
                    size="large"
                    show-password
                    @keyup.enter="handleLogin"
                  >
                    <template #prefix>
                      <el-icon><Lock /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>

                <div class="form-row">
                  <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
                </div>

                <el-form-item>
                  <el-button
                    class="submit-button"
                    type="primary"
                    size="large"
                    :loading="loading"
                    @click="handleLogin"
                  >
                    登录
                  </el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <!-- 注册表单 -->
            <el-tab-pane label="注册" name="register">
              <el-form
                ref="registerFormRef"
                :model="registerForm"
                :rules="registerRules"
                label-width="0"
                class="login-form"
              >
                <el-form-item prop="username">
                  <el-input
                    v-model="registerForm.username"
                    placeholder="用户名"
                    size="large"
                    clearable
                  >
                    <template #prefix>
                      <el-icon><User /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>

                <el-form-item prop="email">
                  <el-input
                    v-model="registerForm.email"
                    placeholder="邮箱"
                    size="large"
                    clearable
                  >
                    <template #prefix>
                      <el-icon><Message /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>

                <el-form-item prop="password">
                  <el-input
                    v-model="registerForm.password"
                    type="password"
                    placeholder="密码"
                    size="large"
                    show-password
                  >
                    <template #prefix>
                      <el-icon><Lock /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>

                <el-form-item prop="confirmPassword">
                  <el-input
                    v-model="registerForm.confirmPassword"
                    type="password"
                    placeholder="确认密码"
                    size="large"
                    show-password
                    @keyup.enter="handleRegister"
                  >
                    <template #prefix>
                      <el-icon><Lock /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>

                <el-form-item>
                  <el-button
                    class="submit-button"
                    type="primary"
                    size="large"
                    :loading="loading"
                    @click="handleRegister"
                  >
                    注册
                  </el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </div>

        <p class="auth-note">
          {{ activeTab === 'login' ? '没有账号？切换到注册即可创建。' : '已有账号？切换到登录继续访问。' }}
        </p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const activeTab = ref('login')
const loading = ref(false)
const loginFormRef = ref(null)
const registerFormRef = ref(null)

const loginForm = reactive({
  username: '',
  password: '',
  remember: false
})

const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const authCopy = computed(() => {
  if (activeTab.value === 'register') {
    return {
      kicker: 'CREATE ACCOUNT',
      title: '创建账号',
      subtitle: '注册后即可参与评论、点赞和收藏。'
    }
  }

  return {
    kicker: 'SIGN IN',
    title: '欢迎回来',
    subtitle: '登录后继续阅读和管理你的互动记录。'
  }
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ]
}

const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在3-20个字符之间', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      const result = await userStore.login({
        username: loginForm.username,
        password: loginForm.password
      })

      if (result.success) {
        ElMessage.success('登录成功')
        // 跳转到之前的页面或首页
        const redirect = route.query.redirect || '/'
        router.push(redirect)
      } else {
        // 显示后端返回的错误消息，持续时间增加到 3 秒
        ElMessage({
          message: result.message || '登录失败',
          type: 'error',
          duration: 3000,
          showClose: true
        })
      }
    } catch (error) {
      console.error('Login error:', error)
      ElMessage({
        message: '登录请求失败，请稍后重试',
        type: 'error',
        duration: 3000,
        showClose: true
      })
    } finally {
      loading.value = false
    }
  })
}

const handleRegister = async () => {
  if (!registerFormRef.value) return

  await registerFormRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      const result = await userStore.register({
        username: registerForm.username,
        email: registerForm.email,
        password: registerForm.password
      })

      if (result.success) {
        ElMessage.success('注册成功')
        router.push('/')
      } else {
        // 显示后端返回的错误消息，持续时间增加到 3 秒
        ElMessage({
          message: result.message || '注册失败',
          type: 'error',
          duration: 3000,
          showClose: true
        })
      }
    } catch (error) {
      console.error('Register error:', error)
      ElMessage({
        message: '注册请求失败，请稍后重试',
        type: 'error',
        duration: 3000,
        showClose: true
      })
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background-image:
    linear-gradient(90deg, rgba(10, 18, 32, 0.9), rgba(10, 18, 32, 0.56)),
    url('../../img/wukong.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 42px 20px;
  position: relative;
}

.login-page::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 68% 30%, rgba(37, 99, 235, 0.24), transparent 32%);
  pointer-events: none;
}

.login-shell {
  width: min(1080px, 100%);
  min-height: 640px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 460px;
  align-items: stretch;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 28px 90px rgba(0, 0, 0, 0.34);
  backdrop-filter: blur(14px);
  position: relative;
  z-index: 1;
}

.login-intro {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 38px;
  color: #fff;
  background:
    linear-gradient(180deg, rgba(15, 23, 42, 0.12), rgba(15, 23, 42, 0.54));
}

.home-button {
  align-self: flex-start;
  color: rgba(255, 255, 255, 0.82);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.home-button:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.18);
}

.brand-lockup {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 34px;
  font-size: 21px;
  font-weight: 800;
}

.brand-icon {
  width: 42px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  color: #fff;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 24px;
}

.intro-copy {
  max-width: 560px;
  margin-top: auto;
}

.intro-kicker {
  margin: 0 0 14px;
  color: rgba(255, 255, 255, 0.72);
  font-size: 13px;
  font-weight: 800;
}

.intro-copy h1 {
  margin: 0;
  color: #fff;
  font-size: 42px;
  font-weight: 850;
  line-height: 1.15;
}

.intro-copy p:last-child {
  max-width: 480px;
  margin: 18px 0 0;
  color: rgba(255, 255, 255, 0.78);
  font-size: 16px;
  line-height: 1.85;
}

.intro-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 42px;
}

.intro-metrics div {
  padding: 14px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
}

.intro-metrics strong,
.intro-metrics span {
  display: block;
}

.intro-metrics strong {
  color: #fff;
  font-size: 15px;
  font-weight: 800;
}

.intro-metrics span {
  margin-top: 4px;
  color: rgba(255, 255, 255, 0.66);
  font-size: 12px;
  font-weight: 650;
}

.auth-panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 46px 42px;
  background: rgba(255, 255, 255, 0.96);
  border-left: 1px solid rgba(255, 255, 255, 0.2);
}

.mobile-auth-top {
  display: none;
}

.login-header {
  margin-bottom: 24px;
}

.login-title {
  margin: 0;
  font-size: 30px;
  font-weight: 820;
  color: var(--leaf-heading);
  line-height: 1.25;
}

.auth-kicker {
  margin: 0 0 8px;
  color: var(--leaf-primary);
  font-size: 12px;
  font-weight: 850;
  letter-spacing: 0;
}

.login-subtitle {
  margin: 10px 0 0;
  font-size: 14px;
  color: var(--leaf-muted);
}

.tabs-shell {
  min-height: 360px;
}

.login-form {
  padding: 18px 0 0;
}

.form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 32px;
  margin: -2px 0 12px;
}

.submit-button {
  width: 100%;
  height: 44px;
  margin-top: 4px;
}

.auth-note {
  margin: 18px 0 0;
  padding-top: 18px;
  border-top: 1px solid var(--leaf-border);
  text-align: center;
  color: var(--leaf-muted);
  font-size: 13px;
}

:deep(.el-form-item) {
  margin-bottom: 18px;
}

:deep(.el-input__wrapper) {
  min-height: 46px;
  padding: 0 14px;
  background: #f8fafc;
  border-radius: 8px;
}

:deep(.el-input__wrapper.is-focus) {
  background: #fff;
  box-shadow: 0 0 0 1px var(--leaf-primary) inset;
}

:deep(.el-tabs__nav-wrap::after) {
  display: none;
}

:deep(.el-tabs__header) {
  margin: 0;
}

:deep(.el-tabs__nav) {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  padding: 4px;
  border-radius: 9px;
  background: #f1f5f9;
}

:deep(.el-tabs__active-bar) {
  display: none;
}

:deep(.el-tabs__item) {
  height: 38px;
  justify-content: center;
  padding: 0;
  border-radius: 7px;
  color: var(--leaf-muted);
  font-size: 16px;
  font-weight: 750;
  transition: color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
}

:deep(.el-tabs__item.is-active) {
  color: var(--leaf-primary);
  background: #fff;
  box-shadow: var(--leaf-shadow-sm);
}

@media (max-width: 900px) {
  .login-shell {
    grid-template-columns: 1fr;
    min-height: auto;
    max-width: 520px;
  }

  .login-intro {
    min-height: 280px;
    padding: 28px;
  }

  .intro-copy h1 {
    font-size: 32px;
  }

  .intro-metrics {
    margin-top: 28px;
  }

  .auth-panel {
    padding: 34px 28px;
    border-left: 0;
  }
}

@media (max-width: 520px) {
  .login-page {
    padding: 18px;
  }

  .login-shell {
    border-radius: 10px;
  }

  .login-intro {
    display: none;
  }

  .auth-panel {
    padding: 28px 22px;
  }

  .mobile-auth-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 28px;
  }

  .mobile-brand {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--leaf-heading);
    font-size: 17px;
    font-weight: 800;
  }

  .mobile-brand .el-icon {
    color: var(--leaf-primary);
    font-size: 22px;
  }

  .login-title {
    font-size: 26px;
  }
}
</style>
