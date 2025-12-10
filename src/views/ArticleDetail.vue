<template>
  <div class="article-detail">
    <div class="container">
      <div class="detail-layout">
        <!-- 左侧主内容区 -->
        <div class="main-content">
          <el-card v-loading="loading" class="article-card">
            <template v-if="article">
              <!-- 文章头部 -->
              <div class="article-header">
                <h1 class="article-title">{{ article.title }}</h1>

                <div class="article-meta">
                  <div class="author-info">
                    <el-avatar :size="40" :src="article.author?.avatar">
                      {{ (article.author?.nickname || article.author?.username)?.charAt(0).toUpperCase() }}
                    </el-avatar>
                    <div class="author-details">
                      <div class="author-name">{{ article.author?.nickname || article.author?.username || '匿名' }}</div>
                      <div class="publish-time">{{ formatDate(article.created_at) }}</div>
                    </div>
                  </div>

                  <div class="article-stats">
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

                <!-- 标签 -->
                <div v-if="article.tags?.length || article.category" class="article-tags">
                  <el-tag v-if="article.category" type="primary" effect="plain">
                    {{ typeof article.category === 'object' ? article.category.name : article.category }}
                  </el-tag>
                  <el-tag
                    v-for="tag in article.tags"
                    :key="tag.id || tag"
                    effect="plain"
                  >
                    {{ typeof tag === 'object' ? tag.name : tag }}
                  </el-tag>
                </div>
              </div>

              <!-- 文章内容 -->
              <div class="article-content" ref="contentRef" v-html="renderedContent"></div>

              <!-- 文章操作 -->
              <div class="article-actions">
                <el-button
                  :type="isLiked ? 'primary' : 'default'"
                  @click="handleLike"
                >
                  <el-icon><Star v-if="!isLiked" /><StarFilled v-else /></el-icon>
                  {{ isLiked ? '已点赞' : '点赞' }} ({{ article.like_count || 0 }})
                </el-button>
                <el-button
                  :type="isFavorited ? 'warning' : 'default'"
                  @click="handleFavorite"
                >
                  <el-icon><Collection v-if="!isFavorited" /><CollectionTag v-else /></el-icon>
                  {{ isFavorited ? '已收藏' : '收藏' }} ({{ article.favorite_count || 0 }})
                </el-button>
              </div>
            </template>
          </el-card>

          <!-- 上一篇/下一篇导航 -->
          <div v-if="adjacentArticles && article" class="article-navigation">
            <div class="nav-item prev" :class="{ disabled: !adjacentArticles.prev }" @click="navigateToArticle(adjacentArticles.prev?.id)">
              <el-icon class="nav-arrow"><ArrowLeft /></el-icon>
              <div class="nav-content">
                <div class="nav-label">上一篇</div>
                <div class="nav-title">{{ adjacentArticles.prev?.title || '没有了' }}</div>
              </div>
            </div>

            <div class="nav-center">
              <div class="nav-meta-item">
                <span class="meta-label">文章分类：</span>
                <el-tag v-if="article.category" type="warning" size="small">
                  {{ typeof article.category === 'object' ? article.category.name : article.category }}
                </el-tag>
                <span v-else style="color: #909399;">未分类</span>
              </div>
              <div class="nav-meta-item" v-if="article.tags?.length">
                <span class="meta-label">文章标签：</span>
                <el-tag
                  v-for="tag in article.tags"
                  :key="tag.id || tag"
                  size="small"
                  effect="plain"
                  style="margin-right: 6px"
                >
                  {{ typeof tag === 'object' ? tag.name : tag }}
                </el-tag>
              </div>
            </div>

            <div class="nav-item next" :class="{ disabled: !adjacentArticles.next }" @click="navigateToArticle(adjacentArticles.next?.id)">
              <div class="nav-content">
                <div class="nav-label">下一篇</div>
                <div class="nav-title">{{ adjacentArticles.next?.title || '没有了' }}</div>
              </div>
              <el-icon class="nav-arrow"><ArrowRight /></el-icon>
            </div>
          </div>

          <!-- 评论区 -->
          <Comment v-if="article" :article-id="article.id" />
        </div>

        <!-- 右侧大纲栏 -->
        <aside class="toc-sidebar" v-if="!loading && tocItems.length > 0">
          <div class="toc-wrapper">
            <div class="toc-title">大纲</div>
            <nav class="toc-nav">
              <div
                v-for="item in tocItems"
                :key="item.id"
                :class="['toc-item', `toc-level-${item.level}`, { active: activeHeading === item.id }]"
                @click="scrollToHeading(item.id)"
              >
                {{ item.text }}
              </div>
            </nav>
          </div>
        </aside>
      </div>
    </div>

    <!-- 图片查看器 -->
    <el-image-viewer
      v-if="imageViewerVisible"
      :url-list="imageViewerList"
      :initial-index="currentImageIndex"
      @close="closeImageViewer"
      :hide-on-click-modal="true"
      :teleported="true"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getArticleDetail, likeArticle, unlikeArticle, favoriteArticle, unfavoriteArticle, getAdjacentArticles } from '@/api/article'
import Comment from '@/components/Comment.vue'
import { ElMessage, ElImageViewer } from 'element-plus'
import { Star, StarFilled, Collection, CollectionTag, View, ChatDotRound, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import python from 'highlight.js/lib/languages/python'
import go from 'highlight.js/lib/languages/go'
import java from 'highlight.js/lib/languages/java'
import cpp from 'highlight.js/lib/languages/cpp'
import c from 'highlight.js/lib/languages/c'
import csharp from 'highlight.js/lib/languages/csharp'
import bash from 'highlight.js/lib/languages/bash'
import sql from 'highlight.js/lib/languages/sql'
import json from 'highlight.js/lib/languages/json'
import xml from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'
import scss from 'highlight.js/lib/languages/scss'
import typescript from 'highlight.js/lib/languages/typescript'
import yaml from 'highlight.js/lib/languages/yaml'
import nginx from 'highlight.js/lib/languages/nginx'
import markdown from 'highlight.js/lib/languages/markdown'
import rust from 'highlight.js/lib/languages/rust'
import php from 'highlight.js/lib/languages/php'
import ruby from 'highlight.js/lib/languages/ruby'
import docker from 'highlight.js/lib/languages/dockerfile'
import kotlin from 'highlight.js/lib/languages/kotlin'
import swift from 'highlight.js/lib/languages/swift'
import scala from 'highlight.js/lib/languages/scala'
import r from 'highlight.js/lib/languages/r'
import perl from 'highlight.js/lib/languages/perl'
import lua from 'highlight.js/lib/languages/lua'
import vim from 'highlight.js/lib/languages/vim'
import ini from 'highlight.js/lib/languages/ini'
import makefile from 'highlight.js/lib/languages/makefile'
import powershell from 'highlight.js/lib/languages/powershell'
import diff from 'highlight.js/lib/languages/diff'
import properties from 'highlight.js/lib/languages/properties'
import 'highlight.js/styles/atom-one-dark.css'
import dayjs from 'dayjs'

// 注册语言
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('js', javascript)
hljs.registerLanguage('python', python)
hljs.registerLanguage('py', python)
hljs.registerLanguage('go', go)
hljs.registerLanguage('golang', go)
hljs.registerLanguage('java', java)
hljs.registerLanguage('cpp', cpp)
hljs.registerLanguage('c++', cpp)
hljs.registerLanguage('c', c)
hljs.registerLanguage('csharp', csharp)
hljs.registerLanguage('cs', csharp)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('shell', bash)
hljs.registerLanguage('sh', bash)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('json', json)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('css', css)
hljs.registerLanguage('scss', scss)
hljs.registerLanguage('sass', scss)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('ts', typescript)
hljs.registerLanguage('yaml', yaml)
hljs.registerLanguage('yml', yaml)
hljs.registerLanguage('nginx', nginx)
hljs.registerLanguage('markdown', markdown)
hljs.registerLanguage('md', markdown)
hljs.registerLanguage('rust', rust)
hljs.registerLanguage('rs', rust)
hljs.registerLanguage('php', php)
hljs.registerLanguage('ruby', ruby)
hljs.registerLanguage('rb', ruby)
hljs.registerLanguage('docker', docker)
hljs.registerLanguage('dockerfile', docker)
hljs.registerLanguage('kotlin', kotlin)
hljs.registerLanguage('kt', kotlin)
hljs.registerLanguage('swift', swift)
hljs.registerLanguage('scala', scala)
hljs.registerLanguage('r', r)
hljs.registerLanguage('perl', perl)
hljs.registerLanguage('pl', perl)
hljs.registerLanguage('lua', lua)
hljs.registerLanguage('vim', vim)
hljs.registerLanguage('viml', vim)
hljs.registerLanguage('ini', ini)
hljs.registerLanguage('toml', ini)
hljs.registerLanguage('makefile', makefile)
hljs.registerLanguage('make', makefile)
hljs.registerLanguage('powershell', powershell)
hljs.registerLanguage('ps', powershell)
hljs.registerLanguage('ps1', powershell)
hljs.registerLanguage('diff', diff)
hljs.registerLanguage('patch', diff)
hljs.registerLanguage('properties', properties)

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const article = ref(null)
const loading = ref(false)
const isLiked = ref(false)
const isFavorited = ref(false)
const contentRef = ref(null)
const tocItems = ref([])
const activeHeading = ref('')
const imageViewerVisible = ref(false)
const imageViewerList = ref([])
const currentImageIndex = ref(0)
const adjacentArticles = ref(null)

// 生成带行号的代码
const generateCodeWithLineNumbers = (rawCode, highlighted) => {
  // 去掉首尾空行
  let rawLines = rawCode.replace(/^\n+/, '').replace(/\n+$/, '').split('\n')
  let highlightedLines = highlighted.replace(/^\n+/, '').replace(/\n+$/, '').split('\n')

  // 关键修复：过滤掉完全空白的行
  // 保持行数一致
  const lineCount = Math.max(rawLines.length, highlightedLines.length)

  // 补齐到相同行数
  while (rawLines.length < lineCount) rawLines.push('')
  while (highlightedLines.length < lineCount) highlightedLines.push('')

  // 生成行号和代码行
  const lineNumbers = rawLines.map((_, i) =>
      `<span class="line-number">${i + 1}</span>`).join('')

  const codeLines = highlightedLines.map(line =>
      `<span class="code-line">${line || '&nbsp;'}</span>`).join('')

  return { lineNumbers, codeLines }
}


const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    // 清理代码
    str = str.replace(/^\n+/, '').replace(/\n+$/, '').trim()

    const displayLang = lang ? lang.toUpperCase() : 'CODE'

    let highlighted = ''
    if (lang && hljs.getLanguage(lang)) {
      try {
        highlighted = hljs.highlight(str, { language: lang, ignoreIllegals: true }).value
      } catch (__) {
        highlighted = hljs.highlightAuto(str).value
      }
    } else {
      highlighted = md.utils.escapeHtml(str)
    }

    // 分割代码行
    const rawLines = str.split('\n')
    const highlightedLines = highlighted.split('\n')

    // 确保行数相等
    const lines = Math.max(rawLines.length, highlightedLines.length)
    const lineNumbers = Array(lines).fill(0)
        .map((_, i) => `<span class="line-number">${i + 1}</span>`)
        .join('')

    const codeLines = Array(lines).fill(0)
        .map((_, i) => {
          const line = highlightedLines[i] || ''
          return `<span class="code-line">${line || '&nbsp;'}</span>`
        })
        .join('')

    return `<div class="code-block-wrapper"><div class="code-block-header"><span class="code-lang-label">${displayLang}</span><button class="code-copy-btn" data-code="${encodeURIComponent(str)}"><svg class="copy-icon" viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg><span class="copy-text">复制代码</span></button></div><div class="code-block-body"><div class="line-numbers-wrapper">${lineNumbers}</div><pre class="hljs${lang ? ` language-${lang}` : ''}"><code>${codeLines}</code></pre></div></div>`
  }
})

const renderedContent = computed(() => {
  // 优先使用 content_markdown 渲染，以便应用代码高亮和复制功能
  if (article.value?.content_markdown) {
    return md.render(article.value.content_markdown)
  }
  // 如果只有 content_html，需要后处理添加代码块功能
  if (article.value?.content_html) {
    return processHtmlCodeBlocks(article.value.content_html)
  }
  return ''
})

// 处理 HTML 中的代码块，添加高亮和复制功能
const processHtmlCodeBlocks = (html) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const preElements = doc.querySelectorAll('pre')

  preElements.forEach(pre => {
    const code = pre.querySelector('code')
    if (!code) return

    // 获取语言
    let lang = ''
    const classList = code.className.split(' ')
    for (const cls of classList) {
      if (cls.startsWith('language-')) {
        lang = cls.replace('language-', '')
        break
      }
    }

    const displayLang = lang ? lang.toUpperCase() : 'CODE'
    const codeText = code.textContent || ''

    // 应用高亮
    let highlightedCode = codeText
    if (lang && hljs.getLanguage(lang)) {
      try {
        highlightedCode = hljs.highlight(codeText, { language: lang, ignoreIllegals: true }).value
      } catch (e) {
        highlightedCode = hljs.highlightAuto(codeText).value
      }
    } else {
      highlightedCode = md.utils.escapeHtml(codeText)
    }

    // 创建新的代码块结构
    const wrapper = doc.createElement('div')
    wrapper.className = 'code-block-wrapper'
    wrapper.innerHTML = `
      <div class="code-block-header">
        <span class="code-lang-label">${displayLang}</span>
        <button class="code-copy-btn" data-code="${encodeURIComponent(codeText)}">
          <svg class="copy-icon" viewBox="0 0 24 24" width="14" height="14">
            <path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
          </svg>
          <span class="copy-text">复制代码</span>
        </button>
      </div>
      <pre class="hljs${lang ? ` language-${lang}` : ''}"><code>${highlightedCode}</code></pre>
    `

    pre.parentNode.replaceChild(wrapper, pre)
  })

  return doc.body.innerHTML
}

// 复制文本到剪贴板的通用函数(支持HTTP环境)
const copyToClipboard = async (text) => {
  // 优先尝试使用现代 Clipboard API
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (err) {
      console.warn('Clipboard API failed, falling back to execCommand', err)
    }
  }

  // 降级方案：使用传统的 document.execCommand 方法
  // 这个方法在HTTP环境下也能工作
  try {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    const successful = document.execCommand('copy')
    document.body.removeChild(textArea)

    return successful
  } catch (err) {
    console.error('复制失败:', err)
    return false
  }
}

// 绑定复制按钮事件
const bindCopyEvents = () => {
  nextTick(() => {
    if (!contentRef.value) return

    const copyButtons = contentRef.value.querySelectorAll('.code-copy-btn')
    copyButtons.forEach(btn => {
      btn.onclick = async (e) => {
        e.preventDefault()
        const code = decodeURIComponent(btn.getAttribute('data-code'))

        try {
          const success = await copyToClipboard(code)

          if (success) {
            const textSpan = btn.querySelector('.copy-text')
            const originalText = textSpan.textContent
            textSpan.textContent = '已复制'
            btn.classList.add('copied')

            setTimeout(() => {
              textSpan.textContent = originalText
              btn.classList.remove('copied')
            }, 2000)
          } else {
            ElMessage.error('复制失败,请手动复制')
          }
        } catch (err) {
          console.error('复制出错:', err)
          ElMessage.error('复制失败,请手动复制')
        }
      }
    })
  })
}

// 绑定图片点击事件
const bindImageEvents = () => {
  nextTick(() => {
    if (!contentRef.value) return

    // 获取文章内容中的所有图片
    const images = contentRef.value.querySelectorAll('img')
    const imageUrls = []

    images.forEach((img, index) => {
      const src = img.getAttribute('src')
      if (src) {
        imageUrls.push(src)

        // 添加点击事件
        img.style.cursor = 'pointer'
        img.onclick = () => {
          currentImageIndex.value = index
          imageViewerList.value = imageUrls
          imageViewerVisible.value = true
        }
      }
    })
  })
}

// 关闭图片查看器
const closeImageViewer = () => {
  imageViewerVisible.value = false
}

// 提取文章大纲
const extractTOC = () => {
  if (!contentRef.value) return

  const headings = contentRef.value.querySelectorAll('h1, h2, h3, h4, h5, h6')
  const items = []

  headings.forEach((heading, index) => {
    const id = `heading-${index}`
    heading.id = id

    items.push({
      id,
      text: heading.textContent,
      level: parseInt(heading.tagName.substring(1))
    })
  })

  tocItems.value = items
}

// 滚动到指定标题
const scrollToHeading = (id) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// 监听滚动，高亮当前所在的标题
const handleScroll = () => {
  if (!contentRef.value || tocItems.value.length === 0) return

  const headings = contentRef.value.querySelectorAll('h1, h2, h3, h4, h5, h6')
  let current = ''

  headings.forEach((heading) => {
    const rect = heading.getBoundingClientRect()
    if (rect.top <= 100) {
      current = heading.id
    }
  })

  activeHeading.value = current
}

onMounted(() => {
  fetchArticle()
  window.addEventListener('scroll', handleScroll)
})

// 监听路由参数变化
watch(() => route.params.id, (newId) => {
  if (newId) {
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' })
    // 重新获取文章数据
    fetchArticle()
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})

const fetchArticle = async () => {
  loading.value = true
  try {
    const res = await getArticleDetail(route.params.id)
    article.value = res.data
    isLiked.value = res.data.is_liked || false
    isFavorited.value = res.data.is_favorited || false

    // 等待 DOM 更新后提取大纲和绑定复制事件
    await nextTick()
    extractTOC()
    bindCopyEvents()
    bindImageEvents()

    // 获取上一篇和下一篇文章
    fetchAdjacentArticles()
  } catch (error) {
    console.error('Failed to fetch article:', error)
    ElMessage.error('文章加载失败')
  } finally {
    loading.value = false
  }
}

// 获取上一篇和下一篇文章
const fetchAdjacentArticles = async () => {
  try {
    const res = await getAdjacentArticles(route.params.id)
    adjacentArticles.value = {
      prev: res.data.prev || null,
      next: res.data.next || null
    }
  } catch (error) {
    console.error('Failed to fetch adjacent articles:', error)
  }
}

// 导航到指定文章
const navigateToArticle = (articleId) => {
  if (articleId) {
    router.push(`/articles/${articleId}`)
  }
}

const handleLike = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }

  try {
    if (isLiked.value) {
      await unlikeArticle(article.value.id)
      article.value.like_count = Math.max(0, (article.value.like_count || 0) - 1)
      isLiked.value = false
      ElMessage.success('已取消点赞')
    } else {
      await likeArticle(article.value.id)
      article.value.like_count = (article.value.like_count || 0) + 1
      isLiked.value = true
      ElMessage.success('点赞成功')
    }
  } catch (error) {
    console.error('Failed to like article:', error)
  }
}

const handleFavorite = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }

  try {
    if (isFavorited.value) {
      await unfavoriteArticle(article.value.id)
      article.value.favorite_count = Math.max(0, (article.value.favorite_count || 0) - 1)
      isFavorited.value = false
      ElMessage.success('已取消收藏')
    } else {
      await favoriteArticle(article.value.id)
      article.value.favorite_count = (article.value.favorite_count || 0) + 1
      isFavorited.value = true
      ElMessage.success('收藏成功')
    }
  } catch (error) {
    console.error('Failed to favorite article:', error)
  }
}

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}
</script>

<style scoped>
.article-detail {
  padding: 20px 0;
}

.detail-layout {
  display: flex;
  gap: 30px;
  position: relative;
}

.main-content {
  flex: 1;
  min-width: 0;
}

.article-card {
  margin-bottom: 30px;
}

.article-header {
  padding-bottom: 24px;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 24px;
}

.article-title {
  font-size: 32px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 20px;
  line-height: 1.4;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.author-name {
  font-weight: 500;
  color: #303133;
}

.publish-time {
  font-size: 14px;
  color: #909399;
}

.article-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #909399;
  font-size: 14px;
}

.article-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.article-content {
  font-size: 16px;
  line-height: 1.8;
  color: #303133;
  margin-bottom: 30px;
}

.article-content :deep(h1),
.article-content :deep(h2),
.article-content :deep(h3),
.article-content :deep(h4),
.article-content :deep(h5),
.article-content :deep(h6) {
  margin: 32px 0 16px;
  font-weight: 600;
  color: #303133;
  position: relative;
  padding-left: 12px;
}

.article-content :deep(h1)::before,
.article-content :deep(h2)::before,
.article-content :deep(h3)::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 70%;
  background: linear-gradient(180deg, #409eff 0%, #67c23a 100%);
  border-radius: 2px;
}

.article-content :deep(h1) {
  font-size: 28px;
  margin-top: 40px;
}
.article-content :deep(h2) {
  font-size: 24px;
  margin-top: 36px;
}
.article-content :deep(h3) {
  font-size: 20px;
  margin-top: 32px;
}

.article-content :deep(p) {
  margin-bottom: 16px;
}

.article-content :deep(a) {
  color: #409eff;
  text-decoration: none;
}

.article-content :deep(a:hover) {
  text-decoration: underline;
}

/* 行内代码样式 */
.article-content :deep(p code),
.article-content :deep(li code) {
  background-color: #f5f7fa;
  padding: 2px 8px;
  border-radius: 3px;
  font-family: 'Comic Sans MS', 'Comic Sans', cursive, sans-serif;
  font-size: 14px;
  color: #e83e8c;
  border: 1px solid #ebeef5;
}

/* 代码块wrapper */
.article-content :deep(.code-block-wrapper) {
  position: relative;
  margin: 0px 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* 代码块头部 */
.article-content :deep(.code-block-header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 12px;
  background: #21252b;
  border-bottom: 1px solid #181a1f;
  margin: 0;
}

.article-content :deep(.code-lang-label) {
  font-size: 12px;
  color: #abb2bf;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-family: 'Comic Sans MS', 'Comic Sans', cursive, sans-serif;
}

.article-content :deep(.code-copy-btn) {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  font-size: 12px;
  color: #abb2bf;
  background: #282c34;
  border: 1px solid #3e4451;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.article-content :deep(.code-copy-btn:hover) {
  color: #61afef;
  border-color: #61afef;
  background: #2c313c;
}

.article-content :deep(.code-copy-btn.copied) {
  color: #98c379;
  border-color: #98c379;
}

.article-content :deep(.copy-icon) {
  display: inline-block;
  vertical-align: middle;
}

/* 代码块主体 - 包含行号和代码 */
.article-content :deep(.code-block-body) {
  display: flex;
  background-color: #282c34;
  margin: 0;
  padding: 0; /* 去掉上下空白 */
}

/* 行号容器 */
.article-content :deep(.line-numbers-wrapper) {
  flex-shrink: 0;
  padding: 0;
  background-color: #21252b;
  text-align: right;
  user-select: none;
  border-right: 1px solid #181a1f;
  margin: 0;
}

/* 单个行号 */
.article-content :deep(.line-number) {
  display: block;
  padding: 0 8px;
  font-size: 14px;
  line-height: 2.4;
  color: #636d83;
  font-family: 'Comic Sans MS', 'Comic Sans', cursive, sans-serif;
  margin: 0;
}

/* 代码块 */
.article-content :deep(pre) {
  margin: 0 !important;
  background-color: #282c34 !important;
  color: #abb2bf !important;
  padding: 0 12px !important;
  overflow-x: auto;
  flex: 1;
  line-height: 2.4;
  font-size: 14px;
}

/* 代码块wrapper内的pre特殊处理 */
.article-content :deep(.code-block-wrapper pre) {
  padding: 0 !important;
  margin: 0 !important;
  line-height: 2.4;
}

/* 单行代码 */
.article-content :deep(.code-line) {
  display: block;
  line-height: 2.4;
  margin: 0; /* 防止多余空白 */
  padding: 0;
}

.article-content :deep(pre code) {
  background-color: transparent !important;
  padding: 0 !important;
  margin: 0 !important;
  color: inherit !important;
  font-family: 'Comic Sans MS', 'Comic Sans', cursive, sans-serif !important;
  font-size: 14px !important;
  border: none !important;
  display: block;
  line-height: 2.4 !important;
}

/* 确保 code 内部没有额外的空白 */
.article-content :deep(.code-block-wrapper pre code) {
  padding: 0 !important;
  margin: 0 !important;
}

/* 移除 code 元素可能的 before/after */
.article-content :deep(pre code)::before,
.article-content :deep(pre code)::after {
  content: none !important;
  display: none !important;
}

.article-content :deep(pre.hljs) {
  margin: 0 !important;
  padding: 0 !important;
  background-color: #282c34 !important;
  line-height: 2.4; /* 让代码行间距紧凑 */
}

.article-content :deep(blockquote) {
  border-left: 4px solid #409eff;
  margin: 16px 0;
  color: #606266;
  font-style: italic;
  background-color: #f5f7fa;
  padding: 12px 16px;
  border-radius: 4px;
}

.article-content :deep(img) {
  max-width: 100%;
  border-radius: 4px;
  margin: 16px 0;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.article-content :deep(img:hover) {
  transform: scale(1.02);
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.15);
}

.article-content :deep(ul),
.article-content :deep(ol) {
  padding-left: 24px;
  margin-bottom: 16px;
}

.article-content :deep(li) {
  margin-bottom: 8px;
}

.article-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.article-content :deep(table th),
.article-content :deep(table td) {
  border: 1px solid #ebeef5;
  padding: 12px;
  text-align: left;
}

.article-content :deep(table th) {
  background-color: #f5f7fa;
  font-weight: 600;
}

.article-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 24px 0;
  border-top: 1px solid #ebeef5;
}

/* 右侧大纲栏 */
.toc-sidebar {
  width: 260px;
  flex-shrink: 0;
}

.toc-wrapper {
  position: sticky;
  top: 80px;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  max-height: calc(100vh - 100px);
  overflow-y: auto;
}

.toc-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #409eff;
}

.toc-nav {
  display: flex;
  flex-direction: column;
}

.toc-item {
  padding: 8px 12px;
  margin: 2px 0;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toc-item:hover {
  background-color: #f5f7fa;
  color: #409eff;
}

.toc-item.active {
  background-color: #ecf5ff;
  color: #409eff;
  font-weight: 500;
}

/* 大纲层级缩进 */
.toc-item.toc-level-1 {
  padding-left: 12px;
  font-weight: 600;
  font-size: 14px;
}

.toc-item.toc-level-2 {
  padding-left: 24px;
  font-size: 14px;
}

.toc-item.toc-level-3 {
  padding-left: 36px;
  font-size: 13px;
}

.toc-item.toc-level-4 {
  padding-left: 48px;
  font-size: 13px;
  color: #909399;
}

.toc-item.toc-level-5 {
  padding-left: 60px;
  font-size: 12px;
  color: #909399;
}

.toc-item.toc-level-6 {
  padding-left: 72px;
  font-size: 12px;
  color: #909399;
}


/* 滚动条样式 */
.toc-wrapper::-webkit-scrollbar {
  width: 6px;
}

.toc-wrapper::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 3px;
}

.toc-wrapper::-webkit-scrollbar-thumb:hover {
  background: #c0c4cc;
}

/* 文章导航样式 */
.article-navigation {
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  gap: 16px;
  padding: 0;
  margin: 40px 0 30px;
  border-top: 1px solid #e4e7ed;
  padding-top: 32px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  padding: 20px 24px;
  background: #fff;
  border: 2px solid #e4e7ed;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  max-width: 320px;
  position: relative;
  overflow: hidden;
}

.nav-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 0;
}

.nav-item:hover:not(.disabled)::before {
  opacity: 1;
}

.nav-item:hover:not(.disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(64, 158, 255, 0.15);
  border-color: #409eff;
}

.nav-item.disabled {
  cursor: not-allowed;
  opacity: 0.4;
  background: #fafafa;
  border-color: #f0f0f0;
}

.nav-item.prev {
  justify-content: flex-start;
}

.nav-item.next {
  justify-content: flex-end;
}

.nav-arrow {
  font-size: 28px;
  color: #409eff;
  flex-shrink: 0;
  z-index: 1;
  transition: transform 0.3s ease;
}

.nav-item:hover:not(.disabled) .nav-arrow {
  transform: scale(1.1);
}

.nav-item.prev:hover:not(.disabled) .nav-arrow {
  transform: translateX(-4px) scale(1.1);
}

.nav-item.next:hover:not(.disabled) .nav-arrow {
  transform: translateX(4px) scale(1.1);
}

.nav-item.disabled .nav-arrow {
  color: #c0c4cc;
}

.nav-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  z-index: 1;
}

.nav-label {
  font-size: 12px;
  color: #909399;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.nav-title {
  font-size: 15px;
  color: #303133;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.5;
}

.nav-item:hover:not(.disabled) .nav-title {
  color: #409eff;
}

.nav-item.disabled .nav-title {
  color: #909399;
}

.nav-center {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  padding: 20px 24px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border: 2px solid #e4e7ed;
  border-radius: 12px;
}

.nav-meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.meta-label {
  color: #606266;
  font-weight: 600;
  white-space: nowrap;
}

@media (max-width: 1200px) {
  .toc-sidebar {
    display: none;
  }
}

@media (max-width: 768px) {
  .article-title {
    font-size: 24px;
  }

  .article-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .article-content :deep(.code-block-header) {
    padding: 8px 12px;
    margin-bottom: 0; /* 删掉头部和内容之间的空隙 */
  }

  .article-content :deep(pre) {
    padding: 16px !important;
  }
  .article-content :deep(pre),
  .article-content :deep(code) {
    margin: 0 !important;
    padding: 0 !important;
  }

  .article-navigation {
    flex-direction: column;
    gap: 12px;
    padding-top: 24px;
  }

  .nav-item {
    max-width: 100%;
    padding: 16px 18px;
  }

  .nav-arrow {
    font-size: 24px;
  }

  .nav-title {
    font-size: 14px;
  }

  .nav-center {
    padding: 16px 18px;
  }

  .nav-meta-item {
    flex-wrap: wrap;
  }
}
</style>
