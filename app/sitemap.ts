import { MetadataRoute } from 'next'
import { getAllArticles } from '@/lib/supabase/articles'
import { getAllWriters } from '@/lib/supabase/writers'

// Topic slugs must stay in sync with topicsData in topics/[slug]/page.tsx
const TOPIC_SLUGS = ['smartphones', 'laptops', 'audio', 'home-appliances', 'gaming', 'cameras']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://comparemag.blog'

  // Static routes
  const routes = ['', '/articles', '/topics', '/writers', '/about'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // Topic hub pages — previously missing from sitemap
  const topicRoutes: MetadataRoute.Sitemap = TOPIC_SLUGS.map((slug) => ({
    url: `${baseUrl}/topics/${slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Articles
  let articleRoutes: MetadataRoute.Sitemap = []
  try {
    const articles = await getAllArticles(true)
    articleRoutes = articles.map((article) => ({
      url: `${baseUrl}/blog/${article.slug}`,
      lastModified: article.updated_at || article.created_at,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch (e) {
    console.error('Failed to fetch articles for sitemap:', e)
  }

  // Writers
  let writerRoutes: MetadataRoute.Sitemap = []
  try {
    const writers = await getAllWriters()
    writerRoutes = writers.map((writer) => ({
      url: `${baseUrl}/writers/${writer.slug}`,
      lastModified: writer.updated_at || writer.created_at,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }))
  } catch (e) {
    console.error('Failed to fetch writers for sitemap:', e)
  }

  return [...routes, ...topicRoutes, ...articleRoutes, ...writerRoutes]
}
