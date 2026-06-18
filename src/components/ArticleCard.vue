<template>
  <el-card class="article-card" shadow="never" :body-style="{ padding: '0' }" @click="handleClick">
    <div class="card-wrapper">
      <div v-if="article.cover" class="cover">
        <img :src="article.cover" :alt="article.title" />
      </div>
      <div v-else class="cover cover-placeholder">
        <el-icon><Document /></el-icon>
      </div>

      <div class="content">
        <div v-if="article.is_pinned" class="pinned-badge">置顶</div>
        <h3 class="title" v-html="highlightText(article.title)"></h3>

        <div v-if="keyword && article.matched_field" class="search-source">
          命中{{ article.matched_field }}
        </div>

        <p class="summary" v-html="highlightText(getSummary())"></p>

        <div class="meta">
          <div class="tags">
            <el-tag
              v-if="article.category"
              type="primary"
              size="small"
              effect="plain"
            >
              {{ typeof article.category === 'object' ? article.category.name : article.category }}
            </el-tag>
            <el-tag
              v-for="tag in article.tags?.slice(0, 3)"
              :key="tag.id || tag"
              size="small"
              effect="plain"
            >
              {{ typeof tag === 'object' ? tag.name : tag }}
            </el-tag>
          </div>

          <div class="stats">
            <span class="stat-item">
              <el-icon><View /></el-icon>
              {{ article.view_count || 0 }}
            </span>
            <span class="stat-item">
              <el-icon><ChatDotRound /></el-icon>
              {{ article.comment_count || 0 }}
            </span>
            <span class="stat-item">
              <el-icon><Star /></el-icon>
              {{ article.like_count || 0 }}
            </span>
          </div>
        </div>

        <div class="footer">
          <div class="author">
            <el-avatar :size="24" :src="article.author?.avatar">
              {{ (article.author?.nickname || article.author?.username)?.charAt(0).toUpperCase() }}
            </el-avatar>
            <span>{{ article.author?.nickname || article.author?.username || '匿名' }}</span>
          </div>
          <div class="date">
            {{ formatDate(article.created_at) }}
          </div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'

const props = defineProps({
  article: {
    type: Object,
    required: true
  },
  keyword: {
    type: String,
    default: ''
  }
})

const router = useRouter()

const handleClick = () => {
  router.push(`/articles/${props.article.id}`)
}

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD')
}

const decodeHtml = (value) => {
  if (!value || typeof document === 'undefined') return value

  const textarea = document.createElement('textarea')
  textarea.innerHTML = value
  return textarea.value
}

const escapeHtml = (value) => {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const escapeRegExp = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const highlightText = (value) => {
  const text = escapeHtml(value)
  const keyword = props.keyword?.trim()
  if (!keyword) return text

  return text.replace(new RegExp(`(${escapeRegExp(escapeHtml(keyword))})`, 'gi'), '<mark class="search-mark">$1</mark>')
}

const getSummary = () => {
  let text = ''

  if (props.keyword && props.article.search_snippet) {
    return props.article.search_snippet
  }

  // 优先使用 summary 字段
  if (props.article.summary && props.article.summary.trim()) {
    text = props.article.summary
  } else {
    // 然后尝试从 content_markdown 或 content 中提取
    text = props.article.content_markdown || props.article.content || ''
  }

  if (text.trim()) {
    text = decodeHtml(text)

    // 移除所有HTML标签
    let plainText = text.replace(/<[^>]+>/g, '')

    // 移除 markdown 标记
    plainText = plainText
      .replace(/!\[.*?\]\(.*?\)/g, '')  // 移除图片链接
      .replace(/\[.*?\]\(.*?\)/g, '')   // 移除普通链接
      .replace(/[#*`>\[\]()]/g, '')     // 移除常见 markdown 符号
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')             // 将多个空白字符替换为单个空格
      .trim()

    if (plainText.length > 200) {
      return plainText.substring(0, 200) + '...'
    }
    return plainText
  }

  return '暂无简介'
}
</script>

<style scoped>
.article-card {
  cursor: pointer;
  margin-bottom: 18px;
  overflow: hidden;
  border-color: var(--leaf-border);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.article-card:hover {
  transform: translateY(-3px);
  border-color: rgba(37, 99, 235, 0.28);
  box-shadow: var(--leaf-shadow-md);
}

.card-wrapper {
  display: flex;
  min-height: 220px;
}

.cover {
  flex-shrink: 0;
  width: 250px;
  min-height: 220px;
  overflow: hidden;
  background: var(--leaf-surface-muted);
}

.cover-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--leaf-primary);
  font-size: 46px;
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.article-card:hover .cover img {
  transform: scale(1.04);
}

.content {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
  padding: 22px 24px;
}

.pinned-badge {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  margin-bottom: 10px;
  padding: 4px 9px;
  border: 1px solid rgba(220, 38, 38, 0.22);
  border-radius: 999px;
  background: rgba(254, 242, 242, 0.92);
  color: #b91c1c;
  font-size: 12px;
  font-weight: 800;
}

:global(html[data-theme='dark']) .pinned-badge {
  border-color: rgba(248, 113, 113, 0.3);
  background: rgba(127, 29, 29, 0.34);
  color: #fca5a5;
}

.title {
  margin: 0 0 10px;
  color: var(--leaf-heading);
  font-size: 23px;
  font-weight: 750;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.35;
  transition: color 0.2s ease;
}

.article-card:hover .title {
  color: var(--leaf-primary);
}

.title :deep(.search-mark),
.summary :deep(.search-mark) {
  padding: 0 3px;
  border-radius: 4px;
  background: #fef3c7;
  color: #92400e;
}

:global(html[data-theme='dark']) .title :deep(.search-mark),
:global(html[data-theme='dark']) .summary :deep(.search-mark) {
  background: rgba(251, 191, 36, 0.22);
  color: #fbbf24;
}

.summary {
  margin: 0 0 18px;
  color: var(--leaf-muted);
  font-size: 15px;
  line-height: 1.75;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.search-source {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  margin: 0 0 8px;
  padding: 2px 7px;
  border: 1px solid rgba(37, 99, 235, 0.2);
  border-radius: 999px;
  background: var(--leaf-primary-soft);
  color: var(--leaf-primary);
  font-size: 12px;
  font-weight: 750;
}

.meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  margin-top: auto;
  margin-bottom: 10px;
}

.tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.stats {
  display: flex;
  gap: 14px;
  flex-shrink: 0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--leaf-subtle);
  font-size: 13px;
  font-weight: 600;
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.author {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--leaf-muted);
  font-size: 14px;
  font-weight: 650;
}

.date {
  color: var(--leaf-subtle);
  font-size: 13px;
  font-weight: 600;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .card-wrapper {
    flex-direction: column;
    min-height: auto;
  }

  .cover {
    width: 100%;
    min-height: 190px;
    height: 190px;
  }

  .content {
    padding: 18px;
  }

  .title {
    font-size: 20px;
  }

  .summary {
    -webkit-line-clamp: 3;
  }

  .meta {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
