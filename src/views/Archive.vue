<template>
  <div class="archive page-shell">
    <div class="container">
      <section class="page-hero archive-hero">
        <div class="page-hero__content">
          <p class="page-hero__kicker">Archive</p>
          <h1 class="page-hero__title">文章归档</h1>
          <p class="page-hero__desc">
            按年份和月份回看所有内容，适合按时间线追踪问题复盘、技术积累和阶段性记录。
          </p>
        </div>

        <div class="metric-strip">
          <div class="metric-tile">
            <strong>{{ archiveTotal }}</strong>
            <span>文章总数</span>
          </div>
          <div class="metric-tile">
            <strong>{{ archives.length }}</strong>
            <span>年份</span>
          </div>
          <div class="metric-tile">
            <strong>{{ archiveMonthCount }}</strong>
            <span>月份</span>
          </div>
        </div>
      </section>

      <div class="archive-toolbar">
        <el-button
          v-if="archives.length > 0"
          size="small"
          @click="toggleAllMonths"
        >
          {{ allCollapsed ? '全部展开' : '全部折叠' }}
        </el-button>
      </div>

      <div v-loading="loading" class="archive-content">
        <div v-for="year in archives" :key="year.year" class="year-group">
          <div class="year-header">
            <h2 class="year-title">{{ year.year }}</h2>
            <span class="year-count">共 {{ year.count }} 篇</span>
          </div>

          <div v-for="month in year.months" :key="month.month" class="month-group">
            <div class="month-header" @click="toggleMonth(year.year, month.month)">
              <el-icon class="collapse-icon" :class="{ collapsed: isMonthCollapsed(year.year, month.month) }">
                <ArrowDown />
              </el-icon>
              <h3 class="month-title">{{ month.month }}月</h3>
              <span class="month-count">{{ month.articles.length }} 篇</span>
            </div>

            <el-collapse-transition>
              <div v-show="!isMonthCollapsed(year.year, month.month)" class="articles-list">
                <div
                  v-for="article in month.articles"
                  :key="article.id"
                  class="article-item"
                  @click="router.push(`/articles/${article.id}`)"
                >
                  <div class="article-date">
                    <span>{{ formatMonth(article.created_at) }}</span>
                    <strong>{{ formatDateDay(article.created_at) }}</strong>
                  </div>
                  <div class="article-info">
                    <h4 class="article-title">{{ article.title }}</h4>
                    <p v-if="article.summary" class="article-summary">{{ article.summary }}</p>
                    <div class="article-meta">
                      <el-tag
                        v-if="article.category && article.category.name"
                        size="small"
                        type="primary"
                        effect="plain"
                      >
                        {{ article.category.name }}
                      </el-tag>
                      <span class="meta-item">
                        <el-icon><View /></el-icon>
                        {{ article.view_count || 0 }}
                      </span>
                      <span class="meta-item">
                        <el-icon><ChatDotRound /></el-icon>
                        {{ article.comment_count || 0 }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </el-collapse-transition>
          </div>
        </div>

        <el-empty v-if="!loading && !archives.length" description="暂无文章" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getArchiveArticles } from '@/api/article'
import dayjs from 'dayjs'

const router = useRouter()

const archives = ref([])
const loading = ref(false)
const collapsedMonths = ref(new Set())
const allCollapsed = ref(false)

const archiveTotal = computed(() => {
  return archives.value.reduce((sum, year) => sum + year.count, 0)
})

const archiveMonthCount = computed(() => {
  return archives.value.reduce((sum, year) => sum + year.months.length, 0)
})

onMounted(() => {
  fetchArchives()
})

const fetchArchives = async () => {
  loading.value = true
  try {
    const { data } = await getArchiveArticles({ limit: 10000 })
    archives.value = processArchiveData(data.list || [])
  } catch (error) {
    console.error('Failed to fetch archives:', error)
    // 如果接口不存在，使用备用方案
    archives.value = []
  } finally {
    loading.value = false
  }
}

// 处理归档数据
const processArchiveData = (articles) => {
  const yearMap = new Map()

  articles.forEach(article => {
    const date = dayjs(article.created_at)
    const year = date.year()
    const month = date.month() + 1

    if (!yearMap.has(year)) {
      yearMap.set(year, new Map())
    }

    const monthMap = yearMap.get(year)
    if (!monthMap.has(month)) {
      monthMap.set(month, [])
    }

    monthMap.get(month).push(article)
  })

  // 转换为数组格式并排序
  const result = []
  const sortedYears = Array.from(yearMap.keys()).sort((a, b) => b - a)

  sortedYears.forEach(year => {
    const monthMap = yearMap.get(year)
    const sortedMonths = Array.from(monthMap.keys()).sort((a, b) => b - a)

    const months = sortedMonths.map(month => ({
      month,
      articles: monthMap.get(month).sort((a, b) =>
        dayjs(b.created_at).unix() - dayjs(a.created_at).unix()
      )
    }))

    const totalCount = months.reduce((sum, month) => sum + month.articles.length, 0)

    result.push({
      year,
      count: totalCount,
      months
    })
  })

  return result
}

const formatMonth = (date) => {
  return dayjs(date).format('MM')
}

const formatDateDay = (date) => {
  return dayjs(date).format('DD')
}

// 切换月份折叠状态
const toggleMonth = (year, month) => {
  const key = `${year}-${month}`
  if (collapsedMonths.value.has(key)) {
    collapsedMonths.value.delete(key)
  } else {
    collapsedMonths.value.add(key)
  }
}

// 检查月份是否折叠
const isMonthCollapsed = (year, month) => {
  return collapsedMonths.value.has(`${year}-${month}`)
}

// 切换全部月份
const toggleAllMonths = () => {
  if (allCollapsed.value) {
    // 全部展开
    collapsedMonths.value.clear()
    allCollapsed.value = false
  } else {
    // 全部折叠
    collapsedMonths.value.clear()
    archives.value.forEach(year => {
      year.months.forEach(month => {
        collapsedMonths.value.add(`${year.year}-${month.month}`)
      })
    })
    allCollapsed.value = true
  }
}
</script>

<style scoped>
.archive {
  padding-bottom: 0;
}

.archive-toolbar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin: -8px 0 24px;
}

.archive-content {
  min-height: 500px;
}

.year-group {
  margin-bottom: 52px;
  position: relative;
}

.year-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 26px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--leaf-border);
}

.year-title {
  font-size: 34px;
  font-weight: 800;
  color: var(--leaf-primary);
  margin: 0;
}

.year-count {
  font-size: 14px;
  color: var(--leaf-muted);
  background-color: var(--leaf-surface);
  border: 1px solid var(--leaf-border);
  padding: 4px 12px;
  border-radius: 12px;
}

.month-group {
  margin-bottom: 40px;
}

.month-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  cursor: pointer;
  user-select: none;
  transition: all 0.3s;
  padding: 8px 12px;
  border-radius: var(--leaf-radius);
}

.month-header:hover {
  background-color: var(--leaf-surface-muted);
}

.collapse-icon {
  font-size: 16px;
  color: var(--leaf-muted);
  transition: transform 0.3s;
}

.collapse-icon.collapsed {
  transform: rotate(-90deg);
}

.month-title {
  font-size: 20px;
  font-weight: 750;
  color: var(--leaf-heading);
  margin: 0;
  padding-left: 12px;
  border-left: 3px solid var(--leaf-green);
  flex: 1;
}

.month-count {
  font-size: 12px;
  color: var(--leaf-muted);
  background-color: #eef2f6;
  padding: 2px 8px;
  border-radius: 10px;
}

.articles-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
  padding-left: 22px;
}

.articles-list::before {
  content: '';
  position: absolute;
  top: 8px;
  bottom: 8px;
  left: 0;
  width: 2px;
  background: #dbe3ef;
}

.article-item {
  display: flex;
  gap: 20px;
  padding: 18px;
  background-color: var(--leaf-surface);
  border: 1px solid var(--leaf-border);
  border-radius: var(--leaf-radius);
  box-shadow: var(--leaf-shadow-sm);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  position: relative;
}

.article-item::before {
  content: '';
  position: absolute;
  top: 34px;
  left: -28px;
  width: 10px;
  height: 10px;
  border: 3px solid #fff;
  border-radius: 50%;
  background: var(--leaf-primary);
  box-shadow: 0 0 0 1px #bfdbfe;
}

.article-item:hover {
  transform: translateY(-2px);
  border-color: rgba(37, 99, 235, 0.28);
  box-shadow: var(--leaf-shadow-md);
}

.article-date {
  width: 62px;
  height: 62px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--leaf-primary);
  color: #fff;
  border-radius: var(--leaf-radius);
  flex-shrink: 0;
}

.article-date span {
  font-size: 12px;
  font-weight: 700;
  opacity: 0.78;
  line-height: 1;
}

.article-date strong {
  margin-top: 5px;
  font-size: 22px;
  font-weight: 820;
  line-height: 1;
}

.article-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.article-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--leaf-heading);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.article-summary {
  font-size: 14px;
  color: var(--leaf-muted);
  margin: 4px 0 0 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.5;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: var(--leaf-subtle);
}

@media (max-width: 768px) {
  .year-title {
    font-size: 24px;
  }

  .article-item {
    flex-direction: column;
  }

  .article-date {
    width: 64px;
    height: 56px;
  }
}
</style>
