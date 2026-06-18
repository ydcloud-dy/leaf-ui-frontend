import { mkdir, writeFile } from 'node:fs/promises'

const siteUrl = (process.env.SITE_URL || 'https://dycloud.fun').replace(/\/$/, '')
const apiBaseUrl = (process.env.SITEMAP_API_BASE_URL || `${siteUrl}/api`).replace(/\/$/, '')
const today = new Date().toISOString()

const staticRoutes = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/articles', priority: '0.9', changefreq: 'daily' },
  { path: '/archive', priority: '0.7', changefreq: 'weekly' },
  { path: '/notes', priority: '0.8', changefreq: 'weekly' },
  { path: '/guestbook', priority: '0.4', changefreq: 'monthly' },
  { path: '/about', priority: '0.5', changefreq: 'monthly' },
  { path: '/stats', priority: '0.3', changefreq: 'weekly' }
]

const escapeXml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

const joinUrl = (base, path) => `${base.replace(/\/$/, '')}/${String(path).replace(/^\//, '')}`

const fetchJson = async (url) => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 3500)

  try {
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
  } finally {
    clearTimeout(timer)
  }
}

const fetchArticles = async () => {
  const articles = []
  const pageSize = 200

  for (let page = 1; page <= 20; page += 1) {
    const url = joinUrl(apiBaseUrl, `/blog/articles?page=${page}&page_size=${pageSize}&status=1`)
    const payload = await fetchJson(url)
    const data = payload?.data || {}
    const list = Array.isArray(data) ? data : (data.list || data.data || [])

    articles.push(...list)

    const total = Number(data.total || list.length)
    if (!list.length || articles.length >= total || list.length < pageSize) break
  }

  return articles
}

const buildSitemap = (articles = []) => {
  const routeEntries = staticRoutes.map(item => ({
    loc: `${siteUrl}${item.path}`,
    lastmod: today,
    changefreq: item.changefreq,
    priority: item.priority
  }))

  const articleEntries = articles
    .filter(article => article?.id)
    .map(article => ({
      loc: `${siteUrl}/articles/${article.id}`,
      lastmod: article.updated_at || article.created_at || today,
      changefreq: 'weekly',
      priority: '0.8'
    }))

  const entries = [...routeEntries, ...articleEntries]

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(item => `  <url>
    <loc>${escapeXml(item.loc)}</loc>
    <lastmod>${escapeXml(new Date(item.lastmod).toISOString())}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`).join('\n')}
</urlset>
`
}

const buildRobots = () => `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`

const main = async () => {
  await mkdir('public', { recursive: true })

  let articles = []
  try {
    articles = await fetchArticles()
    console.log(`sitemap: fetched ${articles.length} articles from ${apiBaseUrl}`)
  } catch (error) {
    console.warn(`sitemap: article API unavailable, generating static sitemap only (${error.message})`)
  }

  await writeFile('public/sitemap.xml', buildSitemap(articles), 'utf8')
  await writeFile('public/robots.txt', buildRobots(), 'utf8')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
