<template>
  <div class="stats page-shell">
    <div class="container">
      <section class="page-hero stats-hero">
        <div class="page-hero__content">
          <p class="page-hero__kicker">Analytics</p>
          <h1 class="page-hero__title">网站统计</h1>
          <p class="page-hero__desc">
            实时观察访问、在线人数和内容规模。数据每 30 秒自动刷新一次。
          </p>
          <p class="refresh-text">最近刷新：{{ lastUpdated || '等待数据' }}</p>
        </div>

        <div class="metric-strip">
          <div class="metric-tile">
            <strong>{{ formatNumber(stats.total_views) }}</strong>
            <span>总浏览量</span>
          </div>
          <div class="metric-tile">
            <strong>{{ stats.online_count }}</strong>
            <span>在线人数</span>
          </div>
          <div class="metric-tile">
            <strong>{{ stats.article_count }}</strong>
            <span>文章</span>
          </div>
        </div>
      </section>

      <div class="stats-featured" v-loading="loading">
        <!-- 网站运行时长 -->
        <div class="stat-card">
          <div class="stat-icon"><el-icon><Refresh /></el-icon></div>
          <div class="stat-label">网站运行时长</div>
          <div class="stat-value">{{ stats.site_runtime }}天</div>
        </div>

        <!-- 24小时访问量 -->
        <div class="stat-card">
          <div class="stat-icon"><el-icon><TrendCharts /></el-icon></div>
          <div class="stat-label">24小时访问量（PV）</div>
          <div class="stat-value">{{ stats.today_views }}次</div>
        </div>

        <!-- 当前在线人数 -->
        <div class="stat-card highlight">
          <div class="stat-icon"><el-icon><Connection /></el-icon></div>
          <div class="stat-label">当前在线人数</div>
          <div class="stat-value">{{ stats.online_count }}人</div>
        </div>

        <!-- 平均访问时长 -->
        <div class="stat-card">
          <div class="stat-icon"><el-icon><Timer /></el-icon></div>
          <div class="stat-label">平均访问时长</div>
          <div class="stat-value">{{ formatDuration(stats.avg_visit_duration) }}</div>
        </div>
      </div>

      <div class="section-heading stats-section-heading">
        <div>
          <h2>内容与互动</h2>
          <p>站内内容规模、用户和评论数据</p>
        </div>
      </div>

      <div class="stats-grid" v-loading="loading">
        <!-- 文章篇数 -->
        <div class="stat-card">
          <div class="stat-icon"><el-icon><Document /></el-icon></div>
          <div class="stat-label">文章篇数</div>
          <div class="stat-value">{{ stats.article_count }}篇</div>
        </div>

        <!-- 笔记篇数 -->
        <div class="stat-card">
          <div class="stat-icon"><el-icon><Notebook /></el-icon></div>
          <div class="stat-label">笔记篇数</div>
          <div class="stat-value">{{ stats.chapter_count }}篇</div>
        </div>

        <!-- 文章分类数 -->
        <div class="stat-card">
          <div class="stat-icon"><el-icon><Collection /></el-icon></div>
          <div class="stat-label">文章分类数</div>
          <div class="stat-value">{{ stats.category_count }}个</div>
        </div>

        <!-- 文章标签数 -->
        <div class="stat-card">
          <div class="stat-icon"><el-icon><CollectionTag /></el-icon></div>
          <div class="stat-label">文章标签数</div>
          <div class="stat-value">{{ stats.tag_count }}个</div>
        </div>

        <!-- 总浏览量 -->
        <div class="stat-card">
          <div class="stat-icon"><el-icon><View /></el-icon></div>
          <div class="stat-label">总浏览量</div>
          <div class="stat-value">{{ formatNumber(stats.total_views) }}</div>
        </div>

        <!-- 评论总数 -->
        <div class="stat-card">
          <div class="stat-icon"><el-icon><ChatDotRound /></el-icon></div>
          <div class="stat-label">评论总数</div>
          <div class="stat-value">{{ stats.comment_count }}条</div>
        </div>

        <!-- 用户总数 -->
        <div class="stat-card">
          <div class="stat-icon"><el-icon><User /></el-icon></div>
          <div class="stat-label">注册用户数</div>
          <div class="stat-value">{{ stats.user_count }}人</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { getStats } from '@/api/stats'
import {
  ChatDotRound,
  Collection,
  CollectionTag,
  Connection,
  Document,
  Notebook,
  Refresh,
  Timer,
  TrendCharts,
  User,
  View
} from '@element-plus/icons-vue'

const loading = ref(false)
const lastUpdated = ref('')
const stats = ref({
  article_count: 0,
  chapter_count: 0,
  category_count: 0,
  tag_count: 0,
  user_count: 0,
  comment_count: 0,
  total_views: 0,
  today_views: 0,
  online_count: 0,
  avg_visit_duration: 0,
  site_runtime: 0
})

let refreshTimer = null

// 格式化时长（秒转为分钟或秒）
const formatDuration = (seconds) => {
  if (seconds === 0) return '0秒/页'
  if (seconds < 60) {
    return `${Math.round(seconds)}秒/页`
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.round(seconds % 60)
  if (remainingSeconds === 0) {
    return `${minutes}分钟/页`
  }
  return `${minutes}分${remainingSeconds}秒/页`
}

// 格式化数字（添加千分位）
const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const formatClock = (date) => {
  return date.toLocaleTimeString('zh-CN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 加载统计数据
const loadStats = async () => {
  try {
    loading.value = true
    const res = await getStats()
    if (res.data) {
      stats.value = res.data
      lastUpdated.value = formatClock(new Date())
    }
  } catch (error) {
    console.error('Failed to load stats:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadStats()

  // 每 30 秒自动刷新统计数据
  refreshTimer = setInterval(() => {
    loadStats()
  }, 30000)
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
})
</script>

<style scoped>
.stats {
  min-height: 100vh;
  padding-bottom: 60px;
  background: var(--leaf-bg);
}

.stats-hero {
  margin-top: 0;
}

.refresh-text {
  margin: 14px 0 0;
  color: var(--leaf-muted);
  font-size: 13px;
  font-weight: 650;
}

.stats-featured,
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 24px;
}

.stats-section-heading {
  margin-top: 34px;
}

.stats-grid {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.stat-card {
  background: var(--leaf-surface);
  border: 1px solid var(--leaf-border);
  border-radius: var(--leaf-radius);
  padding: 32px 24px;
  box-shadow: var(--leaf-shadow-sm);
  text-align: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  cursor: default;
}

.stat-card:hover {
  transform: translateY(-3px);
  border-color: rgba(37, 99, 235, 0.28);
  box-shadow: var(--leaf-shadow-md);
}

.stat-card.highlight {
  background: var(--leaf-primary);
  color: white;
  position: relative;
  overflow: hidden;
}

.stat-card.highlight::before {
  display: none;
}

.stat-icon {
  color: var(--leaf-primary);
  font-size: 42px;
  margin-bottom: 16px;
  line-height: 1;
}

.stat-card.highlight .stat-icon {
  color: #fff;
}

.stat-label {
  font-size: 15px;
  color: var(--leaf-muted);
  margin-bottom: 12px;
  font-weight: 650;
}

.stat-card.highlight .stat-label {
  color: rgba(255, 255, 255, 0.95);
}

.stat-value {
  font-size: 32px;
  font-weight: 800;
  color: var(--leaf-heading);
  line-height: 1;
}

.stat-card.highlight .stat-value {
  color: white;
}

@media (max-width: 768px) {
  .stats-featured {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px;
  }

  .stat-card {
    padding: 24px 16px;
  }

  .stat-icon {
    font-size: 36px;
    margin-bottom: 12px;
  }

  .stat-label {
    font-size: 13px;
  }

  .stat-value {
    font-size: 24px;
  }

  .page-title {
    font-size: 28px;
  }
}

@media (max-width: 520px) {
  .stats-featured {
    grid-template-columns: 1fr;
  }
}
</style>
