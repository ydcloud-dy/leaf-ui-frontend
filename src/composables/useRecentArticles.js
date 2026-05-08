const STORAGE_KEY = 'leaf-recent-articles'
const MAX_ITEMS = 6

const canUseStorage = () => {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
}

const normalizeArticle = (article) => {
  if (!article?.id) return null

  return {
    id: article.id,
    title: article.title || '未命名文章',
    category: typeof article.category === 'object' ? article.category?.name : article.category,
    readAt: Date.now()
  }
}

export const getRecentArticles = () => {
  if (!canUseStorage()) return []

  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(value) ? value : []
  } catch (error) {
    console.warn('Failed to read recent articles:', error)
    return []
  }
}

export const addRecentArticle = (article) => {
  if (!canUseStorage()) return []

  const item = normalizeArticle(article)
  if (!item) return getRecentArticles()

  const nextList = [
    item,
    ...getRecentArticles().filter(recent => String(recent.id) !== String(item.id))
  ].slice(0, MAX_ITEMS)

  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextList))
  return nextList
}

export const clearRecentArticles = () => {
  if (!canUseStorage()) return
  localStorage.removeItem(STORAGE_KEY)
}
