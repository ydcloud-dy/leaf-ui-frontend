<template>
  <div class="main-layout">
    <Header />
    <main class="main-content">
      <router-view />
    </main>
    <footer class="footer">
      <div class="container footer-content">
        <div class="footer-brand">
          <strong>{{ siteSettings.site_name || '个人博客' }}</strong>
          <p>&copy; {{ currentYear }}. {{ siteSettings.copyright || '记录技术实践与生活片段。' }}</p>
        </div>

        <!-- 固定显示备案号 -->
        <p class="record-number">
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
}

.footer {
  background: #111827;
  color: rgba(255, 255, 255, 0.82);
  padding: 28px 0;
  margin-top: 70px;
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.footer-brand strong {
  display: block;
  margin-bottom: 4px;
  color: #fff;
  font-size: 16px;
  font-weight: 750;
}

.footer p {
  margin: 0;
  font-size: 14px;
}

.footer a {
  color: rgba(255, 255, 255, 0.78);
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer a:hover {
  color: #fff;
}

@media (max-width: 768px) {
  .footer {
    margin-top: 48px;
  }

  .footer-content {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
