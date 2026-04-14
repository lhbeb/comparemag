import { Metadata } from 'next'
import type { Article } from '@/lib/supabase/types'

interface ArticleSEOProps {
  article: Article
  siteUrl?: string
}

export function generateArticleMetadata(article: Article, siteUrl: string = 'https://comparemag.blog'): Metadata {
  const url = `${siteUrl}/blog/${article.slug}`
  const imageUrl = article.og_image || article.image_url || `${siteUrl}/placeholder.svg`
  
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
      creator: '@comparemag',
      site: '@comparemag',
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

export function generateArticleStructuredData(article: Article, siteUrl: string = 'https://comparemag.blog') {
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

  return {
    '@context': 'https://schema.org',
    '@type': schemaType,
    headline: article.title,
    description: description,
    image: imageUrl,
    datePublished: article.published_at || article.created_at,
    dateModified: article.updated_at,
    author: {
      '@type': 'Person',
      name: article.author,
      url: `${siteUrl}/writers/${article.author.toLowerCase().replace(/\s+/g, '-')}`
    },
    publisher: generateOrganizationStructuredData(siteUrl),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    articleSection: article.category,
    keywords: article.category,
    inLanguage: 'en-US',
    isAccessibleForFree: true,
    wordCount: article.content.replace(/<[^>]*>/g, '').split(/\s+/).length,
    timeRequired: article.read_time,
  }
}

export function generateBreadcrumbStructuredData(article: Article, siteUrl: string = 'https://comparemag.blog') {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
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
        item: `${siteUrl}/blog/${article.slug}`,
      },
    ],
  }
}

export function generateOrganizationStructuredData(siteUrl: string = 'https://comparemag.blog') {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'CompareMag',
    url: siteUrl,
    logo: `${siteUrl}/icon.svg`,
    sameAs: [
      'https://twitter.com/comparemag',
      'https://github.com/comparemag',
      'https://linkedin.com/company/comparemag',
    ],
    description: 'Exploring the frontiers of artificial intelligence, generative AI, computer vision, and deep learning.',
  }
}

