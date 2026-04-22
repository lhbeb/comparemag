import { Metadata } from 'next'
import type { Article } from '@/lib/supabase/types'
import { SITE_URL, TWITTER_HANDLE } from '@/lib/site-config'

interface ArticleSEOProps {
  article: Article
  siteUrl?: string
}

export function generateArticleMetadata(article: Article, siteUrl: string = SITE_URL): Metadata {
  const url = `${siteUrl}/blog/${article.slug}`
  const imageUrl = article.image_url || article.og_image || `${siteUrl}/placeholder.svg`
  
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
          alt: article.title,
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

export function generateArticleStructuredDataGraph(article: Article, siteUrl: string = SITE_URL) {
  const url = `${siteUrl}/blog/${article.slug}`
  const imageUrl = article.image_url || `${siteUrl}/placeholder.svg`
  
  // Extract text content for description
  const description = article.content
    .replace(/<[^>]*>/g, '')
    .substring(0, 200)
    .trim()

  let schemaType = 'BlogPosting'
  const cat = article.category.toLowerCase()
  if (cat.includes('review') || article.title.toLowerCase().includes('review')) {
    schemaType = 'Review'
  } else if (cat.includes('news') || article.title.toLowerCase().includes('news')) {
    schemaType = 'NewsArticle'
  }

  const authorUrl = `${siteUrl}/writers/${article.author.toLowerCase().replace(/\s+/g, '-')}`
  const siteLogo = `${siteUrl}/favicon.png`

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
        '@type': schemaType,
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
        wordCount: article.content.replace(/<[^>]*>/g, '').split(/\s+/).length,
        timeRequired: article.read_time,
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
      }
    ]
  }
}
