import { siteConfig } from '@/config/site'

const isBrowser = () => typeof document !== 'undefined'

const normalizeUrl = (value = '/') => {
  try {
    return new URL(value, siteConfig.url).toString()
  } catch (error) {
    return siteConfig.url
  }
}

const stripText = (value = '') =>
  String(value || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
    .replace(/\[[^\]]+]\([^)]+\)/g, ' ')
    .replace(/[#>*_`~\-[\]()|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const truncate = (value = '', max = 160) => {
  const text = stripText(value)
  return text.length > max ? `${text.slice(0, max - 1)}...` : text
}

const getOrCreateMeta = (selector, attrs) => {
  let element = document.head.querySelector(selector)
  if (!element) {
    element = document.createElement('meta')
    Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value))
    document.head.appendChild(element)
  }
  return element
}

const setMeta = ({ name, property, content }) => {
  if (!content) return

  const selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`
  const element = getOrCreateMeta(selector, name ? { name } : { property })
  element.setAttribute('content', content)
}

const removeMeta = (selector) => {
  document.head.querySelector(selector)?.remove()
}

const setCanonical = (url) => {
  let element = document.head.querySelector('link[rel="canonical"]')
  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', 'canonical')
    document.head.appendChild(element)
  }
  element.setAttribute('href', url)
}

const setStructuredData = (data) => {
  const id = 'leaf-structured-data'
  const existing = document.getElementById(id)

  if (!data) {
    existing?.remove()
    return
  }

  const element = existing || document.createElement('script')
  element.id = id
  element.type = 'application/ld+json'
  element.textContent = JSON.stringify(data)
  if (!existing) document.head.appendChild(element)
}

const getName = (value) => {
  if (!value) return ''
  if (typeof value === 'object') return value.name || value.title || ''
  return String(value)
}

const absoluteImage = (value) => {
  if (!value) return siteConfig.defaultImage
  return normalizeUrl(value)
}

export const setSeo = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  structuredData
} = {}) => {
  if (!isBrowser()) return

  const fullTitle = title && title !== siteConfig.defaultTitle
    ? `${title} - ${siteConfig.name}`
    : siteConfig.defaultTitle
  const fullDescription = truncate(description || siteConfig.description)
  const fullKeywords = Array.isArray(keywords)
    ? keywords.filter(Boolean).join(',')
    : (keywords || siteConfig.keywords.join(','))
  const fullUrl = normalizeUrl(url || window.location.pathname)
  const fullImage = absoluteImage(image)

  document.title = fullTitle
  setCanonical(fullUrl)

  setMeta({ name: 'description', content: fullDescription })
  setMeta({ name: 'keywords', content: fullKeywords })
  setMeta({ name: 'author', content: siteConfig.author })
  setMeta({ name: 'robots', content: 'index,follow' })

  setMeta({ property: 'og:locale', content: 'zh_CN' })
  setMeta({ property: 'og:site_name', content: siteConfig.name })
  setMeta({ property: 'og:type', content: type })
  setMeta({ property: 'og:title', content: fullTitle })
  setMeta({ property: 'og:description', content: fullDescription })
  setMeta({ property: 'og:url', content: fullUrl })
  setMeta({ property: 'og:image', content: fullImage })

  setMeta({ name: 'twitter:card', content: 'summary_large_image' })
  setMeta({ name: 'twitter:title', content: fullTitle })
  setMeta({ name: 'twitter:description', content: fullDescription })
  setMeta({ name: 'twitter:image', content: fullImage })

  if (publishedTime) {
    setMeta({ property: 'article:published_time', content: publishedTime })
  } else {
    removeMeta('meta[property="article:published_time"]')
  }
  if (modifiedTime) {
    setMeta({ property: 'article:modified_time', content: modifiedTime })
  } else {
    removeMeta('meta[property="article:modified_time"]')
  }

  setStructuredData(structuredData)
}

export const setArticleSeo = (article) => {
  if (!article) return

  const tags = (article.tags || []).map(getName).filter(Boolean)
  const category = getName(article.category)
  const description = article.summary || article.description || article.content_markdown || article.content_html
  const authorName = getName(article.author) || article.author?.nickname || article.author?.username || siteConfig.author
  const url = `/articles/${article.id}`
  const image = absoluteImage(article.cover)

  setSeo({
    title: article.title,
    description,
    keywords: [...tags, category, ...siteConfig.keywords],
    image,
    url,
    type: 'article',
    publishedTime: article.created_at,
    modifiedTime: article.updated_at || article.created_at,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: article.title,
      description: truncate(description),
      image: [image],
      datePublished: article.created_at,
      dateModified: article.updated_at || article.created_at,
      author: {
        '@type': 'Person',
        name: authorName
      },
      publisher: {
        '@type': 'Organization',
        name: siteConfig.name,
        logo: {
          '@type': 'ImageObject',
          url: siteConfig.defaultImage
        }
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': normalizeUrl(url)
      }
    }
  })
}
