<template>
  <header class="header">
    <div class="container">
      <div class="header-content">
        <div class="logo" @click="router.push('/')">
          <el-icon :size="28"><Reading /></el-icon>
          <span>个人博客</span>
        </div>

        <!-- 移动端菜单按钮 -->
        <el-button
          class="mobile-menu-btn"
          :icon="mobileMenuOpen ? 'Close' : 'Menu'"
          @click="mobileMenuOpen = !mobileMenuOpen"
          text
        />

        <nav class="nav" :class="{ 'mobile-open': mobileMenuOpen }">
          <router-link
            to="/"
            class="nav-link"
            :class="{ active: route.name === 'Home' }"
            @click="mobileMenuOpen = false"
          >
            首页
          </router-link>
          <router-link
            to="/articles"
            class="nav-link"
            :class="{ active: ['Articles', 'ArticleDetail'].includes(route.name) }"
            @click="mobileMenuOpen = false"
          >
            文章
          </router-link>

          <!-- 笔记下拉菜单 -->
          <el-dropdown @command="handleNoteCommand" class="notes-dropdown">
            <span class="nav-link notes-link" :class="{ active: route.name === 'Notes' }">
              笔记
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-for="tag in tags"
                  :key="tag.id"
                  :command="tag.name"
                >
                  {{ tag.name }}
                </el-dropdown-item>
                <el-dropdown-item v-if="tags.length === 0" disabled>
                  暂无分类
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <router-link to="/archive" class="nav-link" :class="{ active: route.name === 'Archive' }" @click="mobileMenuOpen = false">归档</router-link>
          <router-link to="/guestbook" class="nav-link" :class="{ active: route.name === 'Guestbook' }" @click="mobileMenuOpen = false">留言板</router-link>
          <router-link to="/stats" class="nav-link" :class="{ active: route.name === 'Stats' }" @click="mobileMenuOpen = false">统计</router-link>
          <router-link to="/about" class="nav-link" :class="{ active: route.name === 'About' }" @click="mobileMenuOpen = false">关于</router-link>
        </nav>

        <div class="header-actions">
          <el-button
            class="theme-toggle"
            circle
            :title="isDark ? '切换浅色模式' : '切换暗色模式'"
            @click="toggleTheme"
          >
            <el-icon>
              <Sunny v-if="isDark" />
              <Moon v-else />
            </el-icon>
          </el-button>

          <el-input
            v-model="searchKeyword"
            placeholder="搜索文章..."
            class="search-input"
            clearable
            @input="handleSearchInput"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>

          <div v-if="userStore.isLoggedIn" class="user-info">
            <el-dropdown @command="handleCommand">
              <div class="user-dropdown">
                <el-avatar :size="36" :src="userStore.avatar">
                  {{ userStore.username.charAt(0).toUpperCase() }}
                </el-avatar>
                <span class="username">{{ userStore.username }}</span>
                <el-icon><ArrowDown /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">
                    <el-icon><User /></el-icon>
                    个人中心
                  </el-dropdown-item>
                  <el-dropdown-item divided command="logout">
                    <el-icon><SwitchButton /></el-icon>
                    退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>

          <el-button v-else type="primary" @click="router.push('/login')" class="login-btn">
            登录
          </el-button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getTags } from '@/api/tag'
import { useTheme } from '@/composables/useTheme'
import { ElMessage } from 'element-plus'
import { ArrowDown, Moon, Sunny } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const searchKeyword = ref('')
const tags = ref([])
const mobileMenuOpen = ref(false)
const { isDark, toggleTheme } = useTheme()
let searchTimer = null

onMounted(() => {
  fetchTags()
})

const fetchTags = async () => {
  try {
    const { data } = await getTags()
    const tagList = Array.isArray(data) ? data : (data.list || [])
    tags.value = tagList
  } catch (error) {
    console.error('Failed to fetch tags:', error)
  }
}

const handleSearchInput = () => {
  // 清除之前的定时器
  if (searchTimer) {
    clearTimeout(searchTimer)
  }

  // 设置新的定时器,500ms后执行搜索
  searchTimer = setTimeout(() => {
    handleSearch()
  }, 500)
}

const handleSearch = () => {
  const keyword = searchKeyword.value.trim()

  // 跳转到文章列表页,如果有关键词则传递,否则显示全部文章
  router.push({
    name: 'Articles',
    query: keyword ? { keyword } : {}
  })
}

const handleNoteCommand = (tagName) => {
  // 关闭移动端菜单
  mobileMenuOpen.value = false
  // 跳转到笔记页面,传递标签名称
  router.push({
    name: 'Notes',
    params: { tag: tagName }
  })
}

const handleCommand = (command) => {
  if (command === 'profile') {
    router.push('/profile')
  } else if (command === 'logout') {
    userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/')
  }
}
</script>

<style scoped>
.header {
  background: rgba(255, 255, 255, 0.94);
  border-bottom: 1px solid rgba(228, 231, 236, 0.9);
  box-shadow: 0 8px 24px rgba(16, 24, 40, 0.06);
  backdrop-filter: blur(14px);
  position: sticky;
  top: 0;
  z-index: 1000;
}

:global(html[data-theme='dark']) .header {
  background: rgba(32, 42, 54, 0.9);
  border-bottom-color: var(--leaf-border);
  box-shadow: 0 8px 22px rgba(3, 7, 18, 0.24);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: var(--leaf-header-height);
  padding: 0;
  gap: 24px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 150px;
  font-size: 20px;
  font-weight: 750;
  color: var(--leaf-heading);
  cursor: pointer;
  transition: color 0.2s ease;
}

.logo:hover {
  color: var(--leaf-primary);
}

.logo .el-icon {
  color: var(--leaf-primary);
}

.nav {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  justify-content: center;
}

.nav-link {
  display: inline-flex;
  align-items: center;
  min-height: 38px;
  padding: 0 12px;
  border-radius: 7px;
  color: var(--leaf-muted);
  text-decoration: none;
  font-size: 15px;
  font-weight: 650;
  transition: color 0.2s ease, background-color 0.2s ease;
  position: relative;
}

.nav-link:hover {
  color: var(--leaf-primary);
  background: var(--leaf-primary-soft);
}

.nav-link.active {
  color: var(--leaf-primary);
  background: var(--leaf-primary-soft);
}

.notes-dropdown {
  display: inline-flex;
  align-items: center;
}

.notes-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  line-height: 1;
}

.notes-link .el-icon {
  font-size: 13px;
}

.header-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  min-width: 320px;
}

.search-input {
  width: 220px;
}

.theme-toggle {
  flex: 0 0 auto;
  color: var(--leaf-muted);
  background: var(--leaf-surface-muted);
  border-color: transparent;
}

.theme-toggle:hover {
  color: var(--leaf-primary);
  background: var(--leaf-primary-soft);
}

.search-input :deep(.el-input__wrapper) {
  background: var(--leaf-surface-muted);
  box-shadow: 0 0 0 1px transparent inset;
}

.search-input :deep(.el-input__wrapper.is-focus) {
  background: #fff;
  box-shadow: 0 0 0 1px var(--leaf-primary) inset;
}

:global(html[data-theme='dark']) .search-input :deep(.el-input__wrapper.is-focus) {
  background: var(--leaf-surface-muted);
}

.user-info {
  cursor: pointer;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px 4px 4px;
  border-radius: 999px;
  transition: background-color 0.2s ease;
}

.user-dropdown:hover {
  background-color: var(--leaf-surface-muted);
}

.username {
  font-size: 14px;
  color: var(--leaf-muted);
  font-weight: 650;
}

.mobile-menu-btn {
  display: none;
  font-size: 24px;
}

@media (max-width: 968px) {
  .header-content {
    gap: 12px;
  }

  .logo {
    min-width: auto;
  }

  .header-actions {
    gap: 10px;
    min-width: auto;
  }

  .search-input {
    width: 140px;
  }

  .username {
    display: none;
  }
}

@media (max-width: 768px) {
  .mobile-menu-btn {
    display: flex;
    order: 2;
  }

  .nav {
    display: none;
    position: absolute;
    top: calc(100% + 1px);
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.98);
    flex-direction: column;
    align-items: stretch;
    padding: 12px;
    gap: 6px;
    border: 1px solid var(--leaf-border);
    border-top: 0;
    border-radius: 0 0 var(--leaf-radius) var(--leaf-radius);
    box-shadow: var(--leaf-shadow-lg);
    z-index: 999;
  }

  :global(html[data-theme='dark']) .nav {
    background: rgba(32, 42, 54, 0.98);
  }

  .nav.mobile-open {
    display: flex;
  }

  .nav-link {
    justify-content: flex-start;
    padding: 8px 12px;
    font-size: 15px;
  }

  .header-content {
    position: relative;
  }

  .logo {
    order: 1;
  }

  .header-actions {
    order: 3;
  }

  .search-input {
    width: 120px;
  }

  .search-input :deep(.el-input__inner) {
    font-size: 14px;
  }

  .login-btn {
    padding: 8px 12px;
    font-size: 14px;
  }

  .user-dropdown .el-icon {
    display: none;
  }
}

@media (max-width: 480px) {
  .header-content {
    min-height: 64px;
  }

  .search-input {
    display: none;
  }

  .logo span {
    display: none;
  }
}
</style>
