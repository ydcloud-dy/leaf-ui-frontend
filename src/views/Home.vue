<template>
  <div class="home">
    <section class="hero">
      <div class="container hero-inner">
        <div class="hero-content">
          <p class="hero-kicker">Leaf Blog</p>
          <h1 class="hero-title">沉淀技术实践，记录系统成长</h1>
          <p class="hero-subtitle">
            聚焦 Go、云原生、工程效率和线上问题复盘，把踩过的坑整理成可复用的经验。
          </p>
          <div class="hero-actions">
            <el-button type="primary" size="large" @click="router.push('/articles')">
              阅读文章
            </el-button>
            <el-button size="large" @click="router.push('/notes')">
              查看笔记
            </el-button>
          </div>
        </div>

        <div class="hero-stats">
          <div class="hero-stat">
            <span class="hero-stat-value">{{ formatNumber(stats.articles || 0) }}</span>
            <span class="hero-stat-label">文章</span>
          </div>
          <div class="hero-stat">
            <span class="hero-stat-value">{{ formatNumber(stats.views || 0) }}</span>
            <span class="hero-stat-label">访问</span>
          </div>
          <div class="hero-stat">
            <span class="hero-stat-value">{{ formatNumber(stats.comments || 0) }}</span>
            <span class="hero-stat-label">评论</span>
          </div>
        </div>
      </div>
    </section>

    <div class="container home-main">
      <div class="section-heading">
        <div>
          <h2>精选文章</h2>
          <p>按热度整理近期值得阅读的内容</p>
        </div>
        <el-button text type="primary" @click="router.push('/articles')">
          查看全部
          <el-icon class="el-icon--right"><ArrowRight /></el-icon>
        </el-button>
      </div>

      <div class="content-wrapper">
        <!-- 文章列表 -->
        <div class="articles-section">
          <div v-loading="loading" class="articles-list">
            <ArticleCard
              v-for="article in articles"
              :key="article.id"
              :article="article"
            />

            <el-empty v-if="!loading && !articles.length" description="暂无文章" />
          </div>

          <!-- 分页 -->
          <div v-if="total > pageSize" class="pagination">
            <el-pagination
              v-model:current-page="currentPage"
              :page-size="pageSize"
              :total="total"
              layout="total, prev, pager, next, jumper"
              @current-change="handlePageChange"
            />
          </div>
        </div>

        <!-- 侧边栏 -->
        <aside class="sidebar">
          <!-- 热门文章 -->
          <section class="sidebar-panel">
            <div class="card-header">
              <el-icon><TrendCharts /></el-icon>
              <span>热门文章</span>
            </div>
            <div class="hot-articles">
              <div
                v-for="(article, index) in hotArticles"
                :key="article.id"
                class="hot-article-item"
                @click="router.push(`/articles/${article.id}`)"
              >
                <span class="rank" :class="{ top: index < 3 }">{{ index + 1 }}</span>
                <span class="title">{{ article.title }}</span>
              </div>
              <el-empty v-if="!hotArticles.length" description="暂无热门文章" :image-size="64" />
            </div>
          </section>

          <!-- 最近阅读 -->
          <section class="sidebar-panel">
            <div class="card-header with-action">
              <div>
                <el-icon><Clock /></el-icon>
                <span>最近阅读</span>
              </div>
              <el-button
                v-if="recentArticles.length"
                text
                size="small"
                class="panel-action"
                @click="handleClearRecent"
              >
                清空
              </el-button>
            </div>
            <div class="recent-list">
              <div
                v-for="article in recentArticles"
                :key="article.id"
                class="recent-item"
                @click="router.push(`/articles/${article.id}`)"
              >
                <div class="recent-title">{{ article.title }}</div>
                <div class="recent-meta">
                  <span>{{ article.category || '未分类' }}</span>
                  <span>{{ formatRecentTime(article.readAt) }}</span>
                </div>
              </div>
              <el-empty v-if="!recentArticles.length" description="暂无阅读记录" :image-size="64" />
            </div>
          </section>

          <!-- 标签云 -->
          <section class="sidebar-panel">
            <div class="card-header">
              <el-icon><CollectionTag /></el-icon>
              <span>标签云</span>
            </div>
            <div class="tags-cloud">
              <el-tag
                v-for="tag in tags"
                :key="tag"
                class="tag-item"
                @click="handleTagClick(tag)"
              >
                {{ tag }}
              </el-tag>
              <el-empty v-if="!tags.length" description="暂无标签" :image-size="64" />
            </div>
          </section>

          <!-- 站点统计 -->
          <section class="sidebar-panel">
            <div class="card-header">
              <el-icon><DataAnalysis /></el-icon>
              <span>站点统计</span>
            </div>
            <div class="stats">
              <div class="stat-item">
                <el-icon><Document /></el-icon>
                <span>文章数</span>
                <strong>{{ formatNumber(stats.articles || 0) }}</strong>
              </div>
              <div class="stat-item">
                <el-icon><View /></el-icon>
                <span>访问量</span>
                <strong>{{ formatNumber(stats.views || 0) }}</strong>
              </div>
              <div class="stat-item">
                <el-icon><ChatDotRound /></el-icon>
                <span>评论数</span>
                <strong>{{ formatNumber(stats.comments || 0) }}</strong>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getArticles } from '@/api/article'
import { getStats, getHotArticles } from '@/api/stats'
import { getTags } from '@/api/tag'
import { getRecentArticles, clearRecentArticles } from '@/composables/useRecentArticles'
import ArticleCard from '@/components/ArticleCard.vue'
import dayjs from 'dayjs'

const router = useRouter()

const articles = ref([])
const hotArticles = ref([])
const tags = ref([])
const stats = ref({})
const recentArticles = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

onMounted(() => {
  fetchArticles()
  fetchHotArticles()
  fetchTags()
  fetchStats()
  recentArticles.value = getRecentArticles()
})

const fetchArticles = async () => {
  loading.value = true
  try {
    const { data } = await getArticles({
      page: currentPage.value,
      page_size: pageSize.value,
      status: 1, // 只获取已发布的文章
      sort: 'views' // 按浏览量排序
    })
    articles.value = data.list || []
    total.value = data.total || 0
  } catch (error) {
    console.error('Failed to fetch articles:', error)
  } finally {
    loading.value = false
  }
}

const fetchHotArticles = async () => {
  try {
    const { data } = await getHotArticles()
    hotArticles.value = data || []
  } catch (error) {
    console.error('Failed to fetch hot articles:', error)
  }
}

const fetchTags = async () => {
  try {
    const { data } = await getTags()
    // 提取标签名称 - TagService 返回数组而非 {list: [...]}
    const tagList = Array.isArray(data) ? data : (data.list || [])
    tags.value = tagList.map(tag => tag.name)
  } catch (error) {
    console.error('Failed to fetch tags:', error)
    tags.value = []
  }
}

const fetchStats = async () => {
  try {
    const { data } = await getStats()
    stats.value = {
      articles: data.article_count || 0,
      views: data.total_views || 0,
      comments: data.comment_count || 0
    }
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    // 如果API失败，使用默认值
    stats.value = {
      articles: 0,
      views: 0,
      comments: 0
    }
  }
}

const handlePageChange = () => {
  fetchArticles()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleTagClick = (tag) => {
  router.push({
    name: 'Articles',
    query: { tag }
  })
}

const handleClearRecent = () => {
  clearRecentArticles()
  recentArticles.value = []
}

const formatRecentTime = (time) => {
  if (!time) return ''
  const readAt = dayjs(time)
  if (dayjs().isSame(readAt, 'day')) return readAt.format('HH:mm')
  return readAt.format('MM-DD')
}

const formatNumber = (num) => {
  const value = Number(num) || 0
  if (value >= 10000) return `${(value / 10000).toFixed(1)}w`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`
  return value.toString()
}
</script>

<style scoped>
.hero {
  position: relative;
  overflow: hidden;
  color: #fff;
  background:
    linear-gradient(90deg, rgba(13, 23, 42, 0.82) 0%, rgba(13, 23, 42, 0.62) 48%, rgba(13, 23, 42, 0.25) 100%),
    url('../../img/wukong.png');
  background-size: cover;
  background-position: center;
}

:global(html[data-theme='dark']) .hero {
  background:
    linear-gradient(90deg, rgba(24, 32, 43, 0.78) 0%, rgba(24, 32, 43, 0.58) 52%, rgba(24, 32, 43, 0.24) 100%),
    url('../../img/wukong.png');
  background-size: cover;
  background-position: center;
}

.hero-inner {
  min-height: 430px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 56px;
  padding: 64px 0;
}

.hero-content {
  max-width: 650px;
}

.hero-kicker {
  display: inline-flex;
  align-items: center;
  margin: 0 0 14px;
  padding: 4px 10px;
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.88);
  font-size: 13px;
  font-weight: 750;
}

.hero-title {
  margin: 0;
  color: #fff;
  font-size: 46px;
  font-weight: 800;
  line-height: 1.14;
  text-shadow: 0 3px 18px rgba(0, 0, 0, 0.28);
}

.hero-subtitle {
  max-width: 560px;
  margin: 18px 0 0;
  color: rgba(255, 255, 255, 0.84);
  font-size: 17px;
  line-height: 1.8;
}

.hero-actions {
  display: flex;
  gap: 12px;
  margin-top: 30px;
}

.hero-actions :deep(.el-button:not(.el-button--primary)) {
  color: #fff;
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.26);
}

.hero-actions :deep(.el-button:not(.el-button--primary):hover) {
  color: #fff;
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.45);
}

.hero-stats {
  width: 270px;
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: var(--leaf-radius);
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
}

:global(html[data-theme='dark']) .hero-stats {
  background: rgba(32, 42, 54, 0.58);
  border-color: rgba(215, 222, 232, 0.2);
}

.hero-stat {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 16px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.16);
}

.hero-stat:last-child {
  border-bottom: 0;
}

.hero-stat-value {
  font-size: 28px;
  font-weight: 800;
  line-height: 1;
}

.hero-stat-label {
  color: rgba(255, 255, 255, 0.72);
  font-size: 14px;
  font-weight: 650;
}

.home-main {
  padding-top: 42px;
}

.content-wrapper {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 310px;
  gap: 28px;
  align-items: start;
}

.articles-section {
  min-height: 500px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 34px;
}

.sidebar {
  position: sticky;
  top: calc(var(--leaf-header-height) + 20px);
  height: fit-content;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sidebar-panel {
  padding: 18px;
  background: var(--leaf-surface);
  border: 1px solid var(--leaf-border);
  border-radius: var(--leaf-radius);
  box-shadow: var(--leaf-shadow-sm);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  margin-bottom: 16px;
  color: var(--leaf-heading);
  font-size: 15px;
  font-weight: 750;
}

.card-header.with-action {
  justify-content: space-between;
}

.card-header.with-action > div {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.card-header .el-icon {
  color: var(--leaf-primary);
}

.panel-action {
  padding: 0 4px;
}

.hot-articles {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hot-article-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 9px 8px;
  border-radius: 7px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.hot-article-item:hover {
  background-color: var(--leaf-surface-muted);
}

.rank {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #eef2f6;
  color: var(--leaf-muted);
  border-radius: 50%;
  font-size: 12px;
  font-weight: 750;
  flex-shrink: 0;
}

.rank.top {
  background-color: var(--leaf-amber);
  color: #fff;
}

.hot-article-item .title {
  flex: 1;
  font-size: 14px;
  color: var(--leaf-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.recent-item {
  padding: 10px;
  border: 1px solid transparent;
  border-radius: 7px;
  background: var(--leaf-surface-muted);
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease, transform 0.2s ease;
}

.recent-item:hover {
  transform: translateY(-1px);
  border-color: rgba(37, 99, 235, 0.28);
  background: var(--leaf-primary-soft);
}

.recent-title {
  margin-bottom: 6px;
  color: var(--leaf-heading);
  font-size: 14px;
  font-weight: 700;
  line-height: 1.45;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.recent-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  color: var(--leaf-subtle);
  font-size: 12px;
  font-weight: 650;
}

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.tag-item:hover {
  transform: translateY(-1px);
  border-color: var(--leaf-primary);
}

.stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-item {
  display: grid;
  grid-template-columns: 20px 1fr auto;
  align-items: center;
  gap: 8px;
  color: var(--leaf-muted);
  font-size: 14px;
}

.stat-item .el-icon {
  color: var(--leaf-primary);
}

.stat-item strong {
  color: var(--leaf-heading);
  font-weight: 750;
}

@media (max-width: 968px) {
  .content-wrapper {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: static;
  }

  .hero-inner {
    min-height: 390px;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 26px;
    padding: 48px 0;
  }

  .hero-title {
    font-size: 38px;
  }

  .hero-stats {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }

  .hero-stat {
    display: flex;
    flex-direction: column;
    gap: 8px;
    border-right: 1px solid rgba(255, 255, 255, 0.16);
    border-bottom: 0;
  }

  .hero-stat:last-child {
    border-right: 0;
  }
}

@media (max-width: 768px) {
  .pagination :deep(.el-pagination) {
    flex-wrap: wrap;
    justify-content: center;
  }

  .pagination :deep(.el-pager) {
    display: flex;
    flex-wrap: wrap;
  }
}

@media (max-width: 560px) {
  .hero-inner {
    min-height: 380px;
  }

  .hero-title {
    font-size: 32px;
  }

  .hero-subtitle {
    font-size: 15px;
  }

  .hero-actions {
    flex-wrap: wrap;
  }

  .hero-stat {
    padding: 12px 10px;
  }

  .hero-stat-value {
    font-size: 22px;
  }

  .home-main {
    padding-top: 30px;
  }
}
</style>
