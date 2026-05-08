<template>
  <div class="articles page-shell">
    <div class="container">
      <section class="page-hero articles-hero">
        <div class="page-hero__content">
          <p class="page-hero__kicker">Articles</p>
          <h1 class="page-hero__title">文章列表</h1>
          <p class="page-hero__desc">
            按发布时间、浏览量和点赞数筛选技术文章，快速定位你正在查找的实践记录。
          </p>
        </div>

        <div class="metric-strip">
          <div class="metric-tile">
            <strong>{{ total }}</strong>
            <span>匹配文章</span>
          </div>
          <div class="metric-tile">
            <strong>{{ currentPage }}</strong>
            <span>当前页</span>
          </div>
          <div class="metric-tile">
            <strong>{{ sortLabel }}</strong>
            <span>排序方式</span>
          </div>
        </div>
      </section>

      <!-- 当前选中的标签 -->
      <div v-if="selectedTag" class="active-tag-filter">
        <span>当前标签：</span>
        <el-tag closable @close="clearTagFilter" type="info" size="large">
          {{ selectedTag }}
        </el-tag>
      </div>

      <!-- 筛选和排序 -->
      <div class="toolbar-panel filters">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索文章..."
          clearable
          class="article-search"
          @input="handleSearchInput"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <div class="filter-actions">
          <el-select
            v-model="sortBy"
            placeholder="排序方式"
            style="width: 150px"
            @change="handleSort"
          >
            <el-option label="最新发布" value="latest" />
            <el-option label="最多浏览" value="views" />
            <el-option label="最多点赞" value="likes" />
          </el-select>
        </div>
      </div>

      <!-- 文章列表 -->
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
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getArticles, searchArticles } from '@/api/article'
import ArticleCard from '@/components/ArticleCard.vue'

const route = useRoute()
const router = useRouter()

const articles = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const searchKeyword = ref('')
const selectedTag = ref('')
const sortBy = ref('latest')
let searchTimer = null

const sortLabel = computed(() => {
  const map = {
    latest: '最新',
    views: '浏览',
    likes: '点赞'
  }
  return map[sortBy.value] || '默认'
})

onMounted(() => {
  // 从URL获取查询参数
  searchKeyword.value = route.query.keyword || ''
  selectedTag.value = route.query.tag || ''
  fetchArticles()
})

watch(() => route.query, () => {
  searchKeyword.value = route.query.keyword || ''
  selectedTag.value = route.query.tag || ''
  currentPage.value = 1
  fetchArticles()
})

const fetchArticles = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      page_size: pageSize.value,
      sort: sortBy.value,
      status: 1 // 只获取已发布的文章
    }

    if (searchKeyword.value && searchKeyword.value.trim()) {
      params.keyword = searchKeyword.value.trim()
    }

    if (selectedTag.value && selectedTag.value.trim()) {
      params.tag = selectedTag.value.trim()
    }

    // 如果有搜索关键词才使用searchArticles,否则使用getArticles
    const apiCall = (searchKeyword.value && searchKeyword.value.trim()) ? searchArticles : getArticles
    const { data } = await apiCall(params)

    articles.value = data.list || []
    total.value = data.total || 0
  } catch (error) {
    console.error('Failed to fetch articles:', error)
  } finally {
    loading.value = false
  }
}

const handleSearchInput = () => {
  // 清除之前的定时器
  if (searchTimer) {
    clearTimeout(searchTimer)
  }

  // 设置新的定时器,300ms后执行搜索
  searchTimer = setTimeout(() => {
    currentPage.value = 1
    fetchArticles()
  }, 300)
}

const handleSort = () => {
  currentPage.value = 1
  fetchArticles()
}

const handlePageChange = () => {
  fetchArticles()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const clearTagFilter = () => {
  router.push({
    name: 'Articles',
    query: {}
  })
}
</script>

<style scoped>
.articles {
  padding-bottom: 0;
}

.filters {
  margin-top: -4px;
}

.article-search {
  max-width: 420px;
}

.filter-actions {
  display: flex;
  gap: 12px;
}

.active-tag-filter {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding: 16px 20px;
  background: var(--leaf-primary-soft);
  border: 1px solid #bfdbfe;
  border-radius: var(--leaf-radius);
}

.active-tag-filter span {
  color: var(--leaf-muted);
  font-weight: 650;
}

.articles-list {
  min-height: 500px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

@media (max-width: 768px) {
  .filter-actions {
    width: 100%;
  }

  .article-search {
    max-width: none;
  }

  .filter-actions .el-select {
    width: 100% !important;
  }
}
</style>
