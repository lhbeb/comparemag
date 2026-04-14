import { MetadataRoute } from 'next'
import { getAllArticles } from '@/lib/supabase/articles'
import { getAllWriters } from '@/lib/supabase/writers'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://comparemag.blog'
  
  // Static routes
  const routes = ['', '/articles', '/topics', '/about'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
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

  return [...routes, ...articleRoutes, ...writerRoutes]
}
