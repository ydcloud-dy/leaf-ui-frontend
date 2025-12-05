<template>
  <div class="main-layout">
    <Header />
    <main class="main-content">
      <router-view />
    </main>
    <footer class="footer">
      <div class="container">
        <p>&copy; {{ currentYear }} {{ siteSettings.site_name || '个人博客' }}. </p>
        <p v-if="siteSettings.copyright">{{ siteSettings.copyright }}</p>

        <!-- 固定显示备案号 -->
        <p>
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">
            京ICP备2022023567号-2
          </a>
        </p>

<!--        <p>Powered by Vue 3 + Element Plus</p>-->
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import Header from '@/components/Header.vue'
import { getSettings } from '@/api/settings'

const siteSettings = ref({})
const currentYear = computed(() => new Date().getFullYear())

const fetchSettings = async () => {
  try {
    const { data } = await getSettings()
    siteSettings.value = data || {}
  } catch (error) {
    console.warn('Failed to fetch settings, using defaults')
    siteSettings.value = {}
  }
}

onMounted(() => {
  fetchSettings()
})
</script>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding: 20px 0;
}

.footer {
  background-color: #2c3e50;
  color: #fff;
  padding: 30px 0;
  text-align: center;
  margin-top: 60px;
}

.footer p {
  margin: 5px 0;
  opacity: 0.8;
}

.footer a {
  color: #fff;
  text-decoration: none;
  opacity: 0.8;
  transition: opacity 0.3s;
}

.footer a:hover {
  opacity: 1;
  text-decoration: underline;
}
</style>
