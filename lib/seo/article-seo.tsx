import { Metadata } from 'next'
import type { Article } from '@/lib/supabase/types'
import type { ProductCardData } from '@/components/blocks/product-card-embed'
import { SITE_URL, TWITTER_HANDLE } from '@/lib/site-config'
import { getArticleImageDeliveryUrl } from '@/lib/article-image-delivery'

interface ArticleSEOProps {
  article: Article
  siteUrl?: string
}

export function generateArticleMetadata(article: Article, siteUrl: string = SITE_URL): Metadata {
  const url = `${siteUrl}/blog/${article.slug}`
  const imageUrl = article.image_url
    ? getArticleImageDeliveryUrl(article.image_url, { absolute: true })
    : article.og_image || `${siteUrl}/placeholder.svg`
  
  // Use provided meta description or generate from content
  const metaDescription = article.meta_description || article.content
    .replace(/<[^>]*>/g, '')
    .substring(0, 160)
    .trim() + '...'
  
  // Use provided OG title or fallback to article title
  const ogTitle = article.og_title || article.title
  
  // Use provided OG description or fallback to meta description
  const ogDescription = article.og_description || metaDescription
  
  // Parse keywords
  const keywords = article.meta_keywords 
    ? article.meta_keywords.split(',').map(k => k.trim())
    : [article.category, 'AI', 'Artificial Intelligence', 'Machine Learning', 'Deep Learning']

  return {
    title: `${article.title} | CompareMag`,
    description: metaDescription,
    keywords: keywords,
    authors: [{ name: article.author }],
    creator: article.author,
    publisher: 'CompareMag',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: article.canonical_url || url,
      siteName: 'CompareMag',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: article.image_alt || article.title,
        },
      ],
      locale: 'en_US',
      type: 'article',
      publishedTime: article.published_at || article.created_at,
      modifiedTime: article.updated_at,
      authors: [article.author],
      section: article.category,
      tags: [article.category, 'AI', 'Machine Learning'],
    },
    twitter: {
      card: (article.twitter_card as 'summary' | 'summary_large_image') || 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      images: [imageUrl],
      creator: TWITTER_HANDLE,
      site: TWITTER_HANDLE,
    },
    robots: {
      index: article.published,
      follow: true,
      googleBot: {
        index: article.published,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    other: {
      'article:published_time': article.published_at || article.created_at,
      'article:modified_time': article.updated_at,
      'article:author': article.author,
      'article:section': article.category,
      'article:tag': article.category,
    },
  }
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
}

type EmbeddedProductReference =
  | {
      type: 'product-card'
      slug: string
    }
  | {
      type: 'amazon-product-card'
      key: string
      product: ProductCardData
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

function getEmbeddedProductReferences(content: string): EmbeddedProductReference[] {
  const references: EmbeddedProductReference[] = []
  const seenProductSlugs = new Set<string>()
  const seenAmazonKeys = new Set<string>()

  // Product schema coverage is intentionally limited to the two product card
  // formats currently rendered by ArticleRenderer:
  // 1. [product-card:slug] database-backed product cards
  // 2. <amazon-product-card ...> inline Amazon cards
  // If a new product card/embed type is added, update this parser and
  // docs/SEO_PRODUCT_SCHEMA_COVERAGE.md so Google receives matching JSON-LD.
  const productPattern = /\[product-card:([^\]]+)\]|<amazon-product-card\b[^>]*>\s*<\/amazon-product-card>/gi

  for (const match of content.matchAll(productPattern)) {
    const fullMatch = match[0]
    const shortcodeSlug = match[1]

    if (shortcodeSlug) {
      if (seenProductSlugs.has(shortcodeSlug)) continue
      seenProductSlugs.add(shortcodeSlug)
      references.push({ type: 'product-card', slug: shortcodeSlug })
      continue
    }

    const attributes = getHtmlAttributes(fullMatch)
    const title = attributes['data-title']
    const url = attributes['data-url']

    if (!title || !url) continue

    const key = `${url}|${title}`
    if (seenAmazonKeys.has(key)) continue
    seenAmazonKeys.add(key)

    references.push({
      type: 'amazon-product-card',
      key,
      product: {
        slug: `amazon-${slugify(title || url)}`,
        title,
        brand: 'Amazon',
        image_url: attributes['data-image-url'] || null,
        short_description: attributes['data-description'] || null,
        cta_label: attributes['data-cta-label'] || 'View details',
        external_url: url,
        price_text: attributes['data-price'] || null,
        rating_text: null,
        badge_text: null,
        specs: null,
      },
    })
  }

  return references
}

function parseRatingValue(value?: string | null) {
  if (!value) return null
  const match = value.match(/(\d+(?:\.\d+)?)/)
  if (!match) return null

  const rating = Number.parseFloat(match[1])
  if (!Number.isFinite(rating)) return null

  const outOfMatch = value.match(/\/\s*(\d+(?:\.\d+)?)/)
  const bestRating = outOfMatch ? Number.parseFloat(outOfMatch[1]) : 5
  if (!Number.isFinite(bestRating) || bestRating <= 0) return null

  return {
    ratingValue: Math.min(Math.max(rating, 0), bestRating),
    bestRating,
  }
}

function parsePrice(value?: string | null) {
  if (!value) return null
  const amountMatch = value.replace(/,/g, '').match(/(\d+(?:\.\d{1,2})?)/)
  if (!amountMatch) return null

  const currency = /€|eur/i.test(value)
    ? 'EUR'
    : /£|gbp/i.test(value)
      ? 'GBP'
      : /¥|jpy/i.test(value)
        ? 'JPY'
        : /mad|dhs?|aed/i.test(value)
          ? (/aed/i.test(value) ? 'AED' : 'MAD')
          : 'USD'

  return {
    price: amountMatch[1],
    priceCurrency: currency,
  }
}

function parseReadTimeToDuration(value?: string | null) {
  if (!value) return undefined
  const match = value.match(/(\d+)/)
  if (!match) return undefined
  return `PT${match[1]}M`
}

function normalizeUrl(url: string, siteUrl: string) {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  if (url.startsWith('/')) return `${siteUrl}${url}`
  return `https://${url}`
}

function buildProductStructuredData({
  article,
  product,
  productSlug,
  position,
  pageUrl,
  siteUrl,
  shouldAddReview,
}: {
  article: Article
  product: ProductCardData
  productSlug: string
  position: number
  pageUrl: string
  siteUrl: string
  shouldAddReview: boolean
}) {
  const productId = `${pageUrl}#product-${slugify(productSlug || product.slug || product.title)}`
  const productUrl = product.external_url ? normalizeUrl(product.external_url, siteUrl) : pageUrl
  const price = parsePrice(product.price_text)
  const rating = parseRatingValue(product.rating_text)

  const productNode: Record<string, unknown> = {
    '@type': 'Product',
    '@id': productId,
    name: product.title,
    description: product.short_description || undefined,
    image: product.image_url ? [normalizeUrl(product.image_url, siteUrl)] : undefined,
    url: productUrl,
    mainEntityOfPage: { '@id': `${pageUrl}#webpage` },
    position,
  }

  if (product.brand) {
    productNode.brand = {
      '@type': 'Brand',
      name: product.brand,
    }
  }

  if (price && product.external_url) {
    productNode.offers = {
      '@type': 'Offer',
      url: productUrl,
      price: price.price,
      priceCurrency: price.priceCurrency,
    }
  }

  if (shouldAddReview && rating) {
    productNode.review = {
      '@type': 'Review',
      '@id': `${productId}-review`,
      itemReviewed: { '@id': productId },
      author: { '@id': `${siteUrl}/writers/${slugify(article.author)}#author` },
      publisher: { '@id': `${siteUrl}/#organization` },
      name: article.title,
      reviewBody: stripHtml(article.meta_description || article.og_description || article.content).substring(0, 500),
      datePublished: article.published_at || article.created_at,
      dateModified: article.updated_at,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: String(rating.ratingValue),
        bestRating: String(rating.bestRating),
        worstRating: '1',
      },
    }
  }

  return Object.fromEntries(
    Object.entries(productNode).filter(([, value]) => value !== undefined && value !== null && value !== '')
  )
}

export function generateArticleStructuredDataGraph(
  article: Article,
  siteUrl: string = SITE_URL,
  preloadedProducts: Record<string, ProductCardData> = {},
) {
  const url = `${siteUrl}/blog/${article.slug}`
  const imageUrl = article.image_url
    ? getArticleImageDeliveryUrl(article.image_url, { absolute: true })
    : `${siteUrl}/placeholder.svg`
  
  // Extract text content for description
  const description = stripHtml(article.content).substring(0, 200)

  let articleSchemaType = 'BlogPosting'
  const cat = article.category.toLowerCase()
  const pageLooksLikeReview = cat.includes('review') || article.title.toLowerCase().includes('review')
  if (cat.includes('news') || article.title.toLowerCase().includes('news')) {
    articleSchemaType = 'NewsArticle'
  }

  const authorUrl = `${siteUrl}/writers/${article.author.toLowerCase().replace(/\s+/g, '-')}`
  const siteLogo = `${siteUrl}/favicon.png`
  const embeddedProductReferences = getEmbeddedProductReferences(article.content)
  const productNodes = embeddedProductReferences
    .map((reference, index) => {
      const product = reference.type === 'product-card'
        ? preloadedProducts[reference.slug]
        : reference.product
      if (!product?.title) return null

      return buildProductStructuredData({
        article,
        product,
        productSlug: reference.type === 'product-card' ? reference.slug : reference.key,
        position: index + 1,
        pageUrl: url,
        siteUrl,
        shouldAddReview: pageLooksLikeReview && index === 0,
      })
    })
    .filter((node): node is Record<string, unknown> => Boolean(node))

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: 'CompareMag',
        url: siteUrl,
        logo: {
          '@type': 'ImageObject',
          '@id': `${siteUrl}/#logo`,
          inLanguage: 'en-US',
          url: siteLogo,
          contentUrl: siteLogo,
        },
        sameAs: [
          'https://twitter.com/comparemag',
          'https://github.com/comparemag',
          'https://linkedin.com/company/comparemag',
        ],
        description: 'Your trusted source for in-depth product reviews, price comparisons, and honest buying guides.',
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: 'CompareMag',
        description: 'Your trusted source for in-depth product reviews, price comparisons, and honest buying guides.',
        publisher: { '@id': `${siteUrl}/#organization` },
        inLanguage: 'en-US'
      },
      {
        '@type': 'ImageObject',
        '@id': `${url}#primaryimage`,
        inLanguage: 'en-US',
        url: imageUrl,
        contentUrl: imageUrl,
        caption: article.image_alt || article.title,
      },
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url: url,
        name: article.title,
        isPartOf: { '@id': `${siteUrl}/#website` },
        primaryImageOfPage: { '@id': `${url}#primaryimage` },
        datePublished: article.published_at || article.created_at,
        dateModified: article.updated_at,
        description: description,
        inLanguage: 'en-US',
      },
      {
        '@type': 'Person',
        '@id': `${authorUrl}#author`,
        name: article.author,
        url: authorUrl,
      },
      {
        '@type': articleSchemaType,
        '@id': `${url}#article`,
        isPartOf: { '@id': `${url}#webpage` },
        author: { '@id': `${authorUrl}#author` },
        publisher: { '@id': `${siteUrl}/#organization` },
        headline: article.title,
        datePublished: article.published_at || article.created_at,
        dateModified: article.updated_at,
        mainEntityOfPage: { '@id': `${url}#webpage` },
        image: { '@id': `${url}#primaryimage` },
        articleSection: article.category,
        keywords: article.category,
        inLanguage: 'en-US',
        isAccessibleForFree: true,
        wordCount: stripHtml(article.content).split(/\s+/).length,
        timeRequired: parseReadTimeToDuration(article.read_time),
        about: productNodes.length > 0
          ? productNodes.map((node) => ({ '@id': (node as Record<string, unknown>)['@id'] }))
          : undefined,
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: siteUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Articles',
            item: `${siteUrl}/articles`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: article.category,
            item: `${siteUrl}/topics/${article.category.toLowerCase().replace(/\s+/g, '-')}`,
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: article.title,
            item: url,
          },
        ],
      },
      ...productNodes,
    ]
  }
}
