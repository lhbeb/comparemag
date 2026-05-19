import { getAllArticles } from '@/lib/supabase/articles'
import { SITE_NAME, SITE_URL } from '@/lib/site-config'
import { getArticleImageDeliveryUrl } from '@/lib/article-image-delivery'

export const revalidate = 3600 // Revalidate the feed every hour

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function cdata(value: string) {
  return `<![CDATA[${value.replace(/\]\]>/g, ']]]]><![CDATA[>')}]]>`
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function getExcerpt(article: { meta_description?: string | null; og_description?: string | null; content?: string | null }) {
  return (
    article.meta_description ||
    article.og_description ||
    stripHtml(article.content || '').slice(0, 240)
  ).trim()
}

function absolutizeHtmlUrls(html: string) {
  return html.replace(/\s(src|href)=["'](\/[^"']*)["']/gi, (_match, attribute, path) => {
    return ` ${attribute}="${SITE_URL}${path}"`
  })
}

function buildFeedContent(article: {
  title: string
  content: string
  image_url?: string | null
  image_alt?: string | null
}) {
  const imageUrl = article.image_url
    ? getArticleImageDeliveryUrl(article.image_url, { absolute: true })
    : null
  const heroImage = imageUrl
    ? `<figure><img src="${escapeXml(imageUrl)}" alt="${escapeXml(article.image_alt || article.title)}" /></figure>`
    : ''

  return `${heroImage}${absolutizeHtmlUrls(article.content || '')}`
}

function getImageMimeType(url: string) {
  const cleanUrl = url.split('?')[0].toLowerCase()

  if (cleanUrl.endsWith('.png')) return 'image/png'
  if (cleanUrl.endsWith('.webp')) return 'image/webp'
  if (cleanUrl.endsWith('.gif')) return 'image/gif'
  if (cleanUrl.endsWith('.avif')) return 'image/avif'
  return 'image/jpeg'
}

export async function GET() {
  const articles = await getAllArticles(true)

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:media="http://search.yahoo.com/mrss/">
    <channel>
      <title>${SITE_NAME}</title>
      <link>${SITE_URL}</link>
      <description>The latest articles and reviews from ${SITE_NAME}</description>
      <language>en</language>
      <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
      <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
      ${articles.map(article => {
        const articleUrl = `${SITE_URL}/blog/${article.slug}`
        const imageUrl = article.image_url
          ? getArticleImageDeliveryUrl(article.image_url, { absolute: true })
          : null
        const excerpt = getExcerpt(article)
        const fullContent = buildFeedContent(article)

        return `
        <item>
          <title>${cdata(article.title)}</title>
          <link>${escapeXml(articleUrl)}</link>
          <guid isPermaLink="true">${escapeXml(articleUrl)}</guid>
          <pubDate>${new Date(article.published_at || article.created_at).toUTCString()}</pubDate>
          <description>${cdata(excerpt)}</description>
          <content:encoded>${cdata(fullContent)}</content:encoded>
          ${imageUrl ? `<enclosure url="${escapeXml(imageUrl)}" type="${getImageMimeType(imageUrl)}" />` : ''}
          ${imageUrl ? `<media:content url="${escapeXml(imageUrl)}" medium="image" />` : ''}
          ${imageUrl ? `<media:thumbnail url="${escapeXml(imageUrl)}" />` : ''}
          ${article.author ? `<dc:creator>${cdata(article.author)}</dc:creator>` : ''}
          ${article.category ? `<category>${cdata(article.category)}</category>` : ''}
        </item>
      `
      }).join('')}
    </channel>
  </rss>`

  return new Response(xml.trim(), {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  })
}
