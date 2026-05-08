<template>
  <div class="notes-page page-shell">
    <section class="container page-hero notes-hero">
      <div class="page-hero__content">
        <p class="page-hero__kicker">Knowledge Base</p>
        <h1 class="page-hero__title">技术笔记</h1>
        <p class="page-hero__desc">
          按主题组织长期笔记和章节目录，适合系统学习、排查问题和回看工程实践。
        </p>
      </div>

      <div class="metric-strip">
        <div class="metric-tile">
          <strong>{{ tags.length }}</strong>
          <span>分类</span>
        </div>
        <div class="metric-tile">
          <strong>{{ chapterTotal }}</strong>
          <span>章节</span>
        </div>
        <div class="metric-tile">
          <strong>{{ noteArticleTotal }}</strong>
          <span>文章</span>
        </div>
      </div>
    </section>

    <div class="notes-container">
      <!-- 左侧边栏 - 分类列表 -->
      <aside class="notes-sidebar">
        <div class="sidebar-header">
          <el-icon><Notebook /></el-icon>
          <span>笔记分类</span>
        </div>
        <div class="category-list">
          <div
            v-for="tag in tags"
            :key="tag.id"
            :class="['category-item', { active: currentTag === tag.name }]"
            @click="selectTag(tag.name)"
          >
            {{ tag.name }}
          </div>
          <el-empty v-if="!tags.length" description="暂无分类" :image-size="80" />
        </div>
      </aside>

      <!-- 右侧主内容区 - 章节目录 -->
      <main class="notes-main" v-loading="loading">
        <div v-if="currentTag" class="chapters-content">
          <div class="content-heading">
            <div>
              <h2 class="content-title">{{ currentTag }}</h2>
              <p class="content-subtitle">
                共 {{ chapterTotal }} 个章节，{{ noteArticleTotal }} 篇文章
              </p>
            </div>
            <div class="content-actions">
              <el-button size="small" @click="expandAllChapters">全部展开</el-button>
              <el-button size="small" @click="expandedChapters = []">全部收起</el-button>
            </div>
          </div>

          <!-- 章节列表（支持多级目录） -->
          <div v-for="chapter in chapters" :key="chapter.id" class="chapter-section">
            <!-- 一级章节标题 -->
            <div
              class="chapter-header"
              :class="{ expanded: expandedChapters.includes(chapter.id) }"
              @click="toggleChapter(chapter.id)"
            >
              <el-icon class="expand-icon">
                <ArrowRight v-if="!expandedChapters.includes(chapter.id)" />
                <ArrowDown v-else />
              </el-icon>
              <h3 class="chapter-name">{{ chapter.name }}</h3>
              <span class="article-count">({{ getTotalArticleCount(chapter) }})</span>
            </div>

            <!-- 一级章节下的内容 -->
            <div v-show="expandedChapters.includes(chapter.id)" class="chapter-content">
              <!-- 一级章节直接下的文章列表 -->
              <div v-if="chapter.articles && chapter.articles.length > 0" class="articles-list">
                <div v-for="article in chapter.articles" :key="article.id" class="article-item" @click="goToArticle(article.id)">
                  <div class="article-title-row">
                    <el-icon class="article-icon"><Document /></el-icon>
                    <span class="article-title">{{ article.title }}</span>
                  </div>
                  <div class="article-meta">
                    <span><el-icon><View /></el-icon> {{ article.view_count || 0 }}</span>
                    <span><el-icon><Calendar /></el-icon> {{ formatDate(article.created_at) }}</span>
                  </div>
                </div>
              </div>

              <!-- 二级章节列表 -->
              <div v-if="chapter.sub_chapters && chapter.sub_chapters.length > 0" class="sub-chapters">
                <div v-for="subChapter in chapter.sub_chapters" :key="subChapter.id" class="sub-chapter-section">
                  <!-- 二级章节标题 -->
                  <div
                    class="sub-chapter-header"
                    :class="{ expanded: expandedChapters.includes(subChapter.id) }"
                    @click="toggleChapter(subChapter.id)"
                  >
                    <el-icon class="expand-icon">
                      <ArrowRight v-if="!expandedChapters.includes(subChapter.id)" />
                      <ArrowDown v-else />
                    </el-icon>
                    <h4 class="sub-chapter-name">{{ subChapter.name }}</h4>
                    <span class="article-count">({{ subChapter.articles?.length || 0 }})</span>
                  </div>

                  <!-- 二级章节下的文章列表 -->
                  <div v-show="expandedChapters.includes(subChapter.id)" class="articles-list sub-articles-list">
                    <div v-for="article in subChapter.articles" :key="article.id" class="article-item" @click="goToArticle(article.id)">
                      <div class="article-title-row">
                        <el-icon class="article-icon"><Document /></el-icon>
                        <span class="article-title">{{ article.title }}</span>
                      </div>
                      <div class="article-meta">
                        <span><el-icon><View /></el-icon> {{ article.view_count || 0 }}</span>
                        <span><el-icon><Calendar /></el-icon> {{ formatDate(article.created_at) }}</span>
                      </div>
                    </div>

                    <el-empty v-if="!subChapter.articles || subChapter.articles.length === 0" description="该章节下暂无文章" :image-size="60" />
                  </div>
                </div>
              </div>

              <!-- 如果一级章节既没有文章也没有子章节 -->
              <el-empty v-if="(!chapter.articles || chapter.articles.length === 0) && (!chapter.sub_chapters || chapter.sub_chapters.length === 0)" description="该章节下暂无内容" :image-size="60" />
            </div>
          </div>

          <el-empty v-if="!loading && chapters.length === 0" description="该分类下暂无章节" />
        </div>

        <div v-else class="empty-state">
          <el-empty description="请从左侧选择一个分类" />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getChaptersByTag } from '@/api/chapter'
import { getTags } from '@/api/tag'
import { Notebook, ArrowRight, ArrowDown, Document, View, Calendar } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const tags = ref([])
const chapters = ref([])
const loading = ref(false)
const currentTag = ref('')
const expandedChapters = ref([])

// 数据缓存
const chaptersCache = ref({})

const chapterTotal = computed(() => {
  return countChapters(chapters.value)
})

const noteArticleTotal = computed(() => {
  return countArticles(chapters.value)
})

onMounted(() => {
  fetchTags()
  // 从路由参数获取标签
  if (route.params.tag) {
    currentTag.value = route.params.tag
    fetchChapters()
  }
})

watch(() => route.params.tag, (newTag) => {
  if (newTag) {
    currentTag.value = newTag
    fetchChapters()
  }
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

const fetchChapters = async () => {
  if (!currentTag.value) return

  // 检查缓存
  if (chaptersCache.value[currentTag.value]) {
    chapters.value = chaptersCache.value[currentTag.value]
    return
  }

  loading.value = true
  try {
    const { data } = await getChaptersByTag(currentTag.value)
    chapters.value = data || []

    // 缓存数据
    chaptersCache.value[currentTag.value] = chapters.value

    // 不再默认展开第一个章节，让用户按需展开
    expandedChapters.value = []
  } catch (error) {
    console.error('Failed to fetch chapters:', error)
  } finally {
    loading.value = false
  }
}

const selectTag = (tagName) => {
  currentTag.value = tagName
  router.push({ name: 'Notes', params: { tag: tagName } })
  fetchChapters()
}

const toggleChapter = (chapterId) => {
  const index = expandedChapters.value.indexOf(chapterId)
  if (index > -1) {
    expandedChapters.value.splice(index, 1)
  } else {
    expandedChapters.value.push(chapterId)
  }
}

const countChapters = (list = []) => {
  return list.reduce((sum, chapter) => {
    return sum + 1 + countChapters(chapter.sub_chapters || [])
  }, 0)
}

const countArticles = (list = []) => {
  return list.reduce((sum, chapter) => {
    return sum + (chapter.articles?.length || 0) + countArticles(chapter.sub_chapters || [])
  }, 0)
}

const collectChapterIds = (list = []) => {
  return list.flatMap(chapter => [
    chapter.id,
    ...collectChapterIds(chapter.sub_chapters || [])
  ])
}

const expandAllChapters = () => {
  expandedChapters.value = collectChapterIds(chapters.value)
}

// 计算章节下的总文章数（包括子章节的文章）
const getTotalArticleCount = (chapter) => {
  let count = chapter.articles?.length || 0

  // 如果有子章节，累加子章节的文章数
  if (chapter.sub_chapters && chapter.sub_chapters.length > 0) {
    chapter.sub_chapters.forEach(subChapter => {
      count += subChapter.articles?.length || 0
    })
  }

  return count
}

const goToArticle = (articleId) => {
  router.push(`/articles/${articleId}`)
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
</script>

<style scoped>
.notes-page {
  min-height: calc(100vh - var(--leaf-header-height));
  background-color: var(--leaf-bg);
}

.notes-hero {
  width: min(1400px, calc(100% - 40px));
  margin: 0 auto 24px;
  padding: 24px 28px;
}

.notes-container {
  display: flex;
  width: min(1400px, calc(100% - 40px));
  max-width: none;
  margin: 0 auto;
  min-height: 620px;
  border: 1px solid var(--leaf-border);
  border-radius: var(--leaf-radius);
  background: var(--leaf-surface);
  box-shadow: var(--leaf-shadow-sm);
  overflow: hidden;
}

/* 左侧边栏 */
.notes-sidebar {
  width: 280px;
  background-color: var(--leaf-surface);
  border-right: 1px solid var(--leaf-border);
  flex-shrink: 0;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 20px;
  font-size: 18px;
  font-weight: 750;
  color: var(--leaf-heading);
  border-bottom: 1px solid var(--leaf-border);
}

.sidebar-header .el-icon {
  color: var(--leaf-primary);
}

.category-list {
  padding: 10px 0;
}

.category-item {
  padding: 12px 20px;
  color: var(--leaf-muted);
  cursor: pointer;
  font-weight: 650;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.category-item:hover {
  background-color: var(--leaf-surface-muted);
  color: var(--leaf-primary);
}

.category-item.active {
  background-color: var(--leaf-primary-soft);
  color: var(--leaf-primary);
  border-left-color: var(--leaf-primary);
}

/* 右侧主内容 */
.notes-main {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
  background-color: #fbfcfe;
}

.content-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 26px;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--leaf-border);
}

.content-title {
  font-size: 24px;
  font-weight: 800;
  color: var(--leaf-heading);
  margin: 0;
}

.content-subtitle {
  margin: 6px 0 0;
  color: var(--leaf-muted);
  font-size: 14px;
}

.content-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.chapter-section {
  margin-bottom: 15px;
}

.chapter-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 20px;
  background-color: var(--leaf-surface);
  color: var(--leaf-heading);
  border: 1px solid var(--leaf-border);
  border-left: 4px solid var(--leaf-primary);
  border-radius: var(--leaf-radius);
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--leaf-shadow-sm);
}

.chapter-header:hover {
  border-color: rgba(37, 99, 235, 0.28);
  box-shadow: var(--leaf-shadow-md);
}

.chapter-header.expanded {
  border-radius: var(--leaf-radius) var(--leaf-radius) 0 0;
}

.chapter-content {
  background-color: var(--leaf-surface);
  border: 1px solid var(--leaf-border);
  border-top: none;
  border-radius: 0 0 var(--leaf-radius) var(--leaf-radius);
  padding: 15px;
}

/* 二级章节样式 */
.sub-chapters {
  margin-top: 10px;
}

.sub-chapter-section {
  margin-bottom: 10px;
}

.sub-chapter-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 15px;
  background-color: var(--leaf-surface-muted);
  color: var(--leaf-heading);
  border: 1px solid var(--leaf-border);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: none;
}

.sub-chapter-header:hover {
  background-color: var(--leaf-primary-soft);
  box-shadow: none;
}

.sub-chapter-header.expanded {
  border-radius: 6px 6px 0 0;
}

.sub-chapter-name {
  flex: 1;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--leaf-heading);
}

.sub-articles-list {
  background-color: var(--leaf-surface-muted);
  border: 1px solid var(--leaf-border);
  border-top: none;
  border-radius: 0 0 6px 6px;
  padding: 10px;
}

.expand-icon {
  flex-shrink: 0;
  font-size: 16px;
  color: var(--leaf-primary);
  transition: transform 0.3s;
}

.chapter-name {
  flex: 1;
  margin: 0;
  font-size: 18px;
  font-weight: 750;
  color: var(--leaf-heading);
}

.article-count {
  font-size: 14px;
  color: var(--leaf-muted);
  font-weight: normal;
}

.articles-list {
  background-color: var(--leaf-surface);
  padding: 0;
}

.sub-articles-list .article-item {
  background-color: #fff;
}

.article-item {
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 6px;
  background-color: var(--leaf-surface-muted);
  border-left: 3px solid var(--leaf-primary);
  transition: all 0.2s ease;
  cursor: pointer;
}

.article-item:hover {
  background-color: var(--leaf-primary-soft);
  box-shadow: none;
  transform: translateX(3px);
}

.article-item:last-child {
  margin-bottom: 0;
}

.article-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.article-icon {
  color: var(--leaf-primary);
  font-size: 18px;
  flex-shrink: 0;
}

.article-title {
  flex: 1;
  font-size: 16px;
  font-weight: 500;
  color: var(--leaf-heading);
  transition: color 0.3s;
}

.article-item:hover .article-title {
  color: var(--leaf-primary);
}

.article-meta {
  display: flex;
  gap: 15px;
  padding-left: 28px;
  font-size: 12px;
  color: var(--leaf-subtle);
}

.article-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
}

/* 响应式 */
@media (max-width: 768px) {
  .notes-container {
    width: min(100% - 28px, 1400px);
  }

  .notes-hero {
    width: min(100% - 28px, 1400px);
    padding: 22px;
  }

  .notes-container {
    flex-direction: column;
  }

  .notes-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--leaf-border);
  }

  .category-list {
    display: flex;
    flex-wrap: wrap;
    padding: 10px;
    gap: 10px;
  }

  .category-item {
    padding: 8px 16px;
    border-radius: 20px;
    border-left: none;
    background-color: var(--leaf-surface-muted);
  }

  .category-item.active {
    background-color: var(--leaf-primary);
    color: #fff;
  }

  .notes-main {
    padding: 20px;
  }

  .content-heading {
    flex-direction: column;
  }
}
</style>
