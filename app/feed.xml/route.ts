import { getAllArticles } from '@/lib/supabase/articles'
import { getAllProducts } from '@/lib/supabase/products'
import type { ProductCard } from '@/lib/supabase/types'
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

function stripFeedShortcodes(value: string) {
  return value
    .replace(/\[product-card:[^\]]+\]/gi, '')
    .replace(/<amazon-product-card\b[^>]*>\s*<\/amazon-product-card>/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function getExcerpt(article: { meta_description?: string | null; og_description?: string | null; content?: string | null }) {
  const excerpt = (
    article.meta_description ||
    article.og_description ||
    stripHtml(article.content || '').slice(0, 240)
  ).trim()

  return stripFeedShortcodes(excerpt)
}

function absolutizeHtmlUrls(html: string) {
  return html.replace(/\s(src|href)=["'](\/[^"']*)["']/gi, (_match, attribute, path) => {
    return ` ${attribute}="${SITE_URL}${path}"`
  })
}

function normalizeUrl(url?: string | null) {
  if (!url) return null
  if (/^https?:\/\//i.test(url)) return url
  if (url.startsWith('/')) return `${SITE_URL}${url}`
  return `https://${url}`
}

function decodeHtmlAttribute(value: string) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

function getHtmlAttributes(tag: string) {
  const attributes: Record<string, string> = {}

  for (const match of tag.matchAll(/([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
    attributes[match[1]] = decodeHtmlAttribute(match[2] ?? match[3] ?? '')
  }

  return attributes
}

function getProductSpecs(specs: ProductCard['specs']) {
  if (!specs || typeof specs !== 'object' || Array.isArray(specs)) return []

  return Object.entries(specs as Record<string, unknown>)
    .filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== '')
    .slice(0, 6)
}

function buildPortableProductCard(product: {
  title: string
  brand?: string | null
  image_url?: string | null
  short_description?: string | null
  price_text?: string | null
  external_url?: string | null
  cta_label?: string | null
  specs?: ProductCard['specs']
}) {
  const imageUrl = normalizeUrl(product.image_url)
  const externalUrl = normalizeUrl(product.external_url)
  const specs = getProductSpecs(product.specs)
  const ctaLabel = product.cta_label || 'Check price'

  return `
    <div>
      ${product.brand ? `<p><strong>${escapeXml(product.brand)}</strong></p>` : ''}
      <h3>${escapeXml(product.title)}</h3>
      ${imageUrl ? `<p><img src="${escapeXml(imageUrl)}" alt="${escapeXml(product.title)}" /></p>` : ''}
      ${product.short_description ? `<p>${escapeXml(product.short_description)}</p>` : ''}
      ${specs.length > 0 ? `
        <ul>
          ${specs.map(([key, value]) => `<li><strong>${escapeXml(key)}:</strong> ${escapeXml(String(value))}</li>`).join('')}
        </ul>
      ` : ''}
      ${product.price_text ? `<p><strong>Price:</strong> ${escapeXml(product.price_text)}</p>` : ''}
      ${externalUrl ? `<p><a href="${escapeXml(externalUrl)}" rel="nofollow sponsored">${escapeXml(ctaLabel)}</a></p>` : ''}
    </div>
  `
}

function renderAmazonProductCard(tag: string) {
  const attributes = getHtmlAttributes(tag)
  const title = attributes['data-title']
  const url = attributes['data-url']

  if (!title || !url) return ''

  return buildPortableProductCard({
    title,
    brand: 'Amazon',
    image_url: attributes['data-image-url'] || null,
    short_description: attributes['data-description'] || null,
    price_text: attributes['data-price'] || null,
    external_url: url,
    cta_label: attributes['data-cta-label'] || 'View on Amazon',
  })
}

function renderProductCardsForFeed(html: string, productsBySlug: Map<string, ProductCard>) {
  return html
    .replace(/\[product-card:([^\]]+)\]/gi, (match, slug) => {
      const productSlug = String(slug).trim()
      const product = productsBySlug.get(productSlug)

      if (product) {
        return buildPortableProductCard(product)
      }

      const readableTitle = productSlug
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase())

      return `
        <div>
          <h3>${escapeXml(readableTitle)}</h3>
          <p>This product card is available in the original CompareMag article.</p>
        </div>
      `
    })
    .replace(/<amazon-product-card\b[^>]*>\s*<\/amazon-product-card>/gi, (tag) => {
      return renderAmazonProductCard(tag)
    })
}

function linkArticleHeadings(html: string, articleUrl: string) {
  return html.replace(/<h([1-6])([^>]*)>([\s\S]*?)<\/h\1>/gi, (match, level, attributes, innerHtml) => {
    if (/<a\b/i.test(innerHtml)) return match

    return `<h${level}${attributes}><a href="${escapeXml(articleUrl)}">${innerHtml}</a></h${level}>`
  })
}

function buildFeedContent(article: {
  slug: string
  title: string
  content: string
  image_url?: string | null
  image_alt?: string | null
}, productsBySlug: Map<string, ProductCard>) {
  const articleUrl = `${SITE_URL}/blog/${article.slug}`
  const imageUrl = article.image_url
    ? getArticleImageDeliveryUrl(article.image_url, { absolute: true })
    : null
  const heroImage = imageUrl
    ? `<figure><img src="${escapeXml(imageUrl)}" alt="${escapeXml(article.image_alt || article.title)}" /></figure>`
    : ''
  const originalArticleLink = `<p><a href="${escapeXml(articleUrl)}"><strong>Read the original article on CompareMag</strong></a></p>`
  const linkedHeadingsContent = linkArticleHeadings(article.content || '', articleUrl)
  const content = renderProductCardsForFeed(linkedHeadingsContent, productsBySlug)

  return `${heroImage}${originalArticleLink}${absolutizeHtmlUrls(content)}`
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
  const [articles, products] = await Promise.all([
    getAllArticles(true),
    getAllProducts(false),
  ])
  const productsBySlug = new Map(products.map((product) => [product.slug, product]))

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
        const fullContent = buildFeedContent(article, productsBySlug)

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
