import { getArticleBySlug, getAllSlugs, getAllArticles } from "@/lib/supabase/articles"
import { BlogPostContent } from "@/components/blog-post-content"
import { notFound } from "next/navigation"
import type { BlogPost } from "@/lib/data/blogPosts"
import { generateArticleMetadata, generateArticleStructuredDataGraph } from "@/lib/seo/article-seo"
import { StructuredData } from "@/components/seo/structured-data"
import { getPreloadProducts } from "@/lib/products/embed"
import type { Metadata } from "next"

// Required for static export - generates all static paths at build time
export async function generateStaticParams() {
  try {
    const slugs = await getAllSlugs()
    return slugs.map((slug) => ({
      slug: slug,
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

// Note: For static export, generateStaticParams defines which routes are pre-generated
// Routes not in generateStaticParams will show 404 via notFound() below
// We don't set dynamicParams = false to allow graceful 404 handling

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> | { slug: string } }): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params)
  const slug = resolvedParams.slug?.replace(/\/$/, '') || resolvedParams.slug
  
  if (!slug) {
    return {}
  }
  
  const article = await getArticleBySlug(slug)
  if (!article) {
    return {}
  }

  return generateArticleMetadata(article)
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  // Handle both sync and async params (Next.js 15+)
  const resolvedParams = await Promise.resolve(params)
  // Handle potential trailing slash and normalize slug
  const slug = resolvedParams.slug?.replace(/\/$/, '') || resolvedParams.slug
  
  if (!slug) {
    notFound()
  }
  
  const article = await getArticleBySlug(slug)
  if (!article) {
    notFound()
  }

  const allArticles = await getAllArticles(true)
  // Advanced algorithm: Prioritize same category, backfill with others to ensure engagement
  const otherAvailableArticles = allArticles.filter(a => a.slug !== article.slug)
  const categoryMatches = otherAvailableArticles.filter(a => a.category === article.category)
  const backfillArticles = otherAvailableArticles.filter(a => a.category !== article.category)
  
  const relatedArticles = [...categoryMatches, ...backfillArticles]
    .slice(0, 7)
    .map(a => ({
      title: a.title,
      slug: a.slug,
      image: a.image_url || "/placeholder.svg",
      category: a.category,
    }))

  // Server-side preload for high-performance zero-waterfall embed rendering
  const preloadedProducts = await getPreloadProducts(article.content)
  
  const post: BlogPost = {
    title: article.title,
    date: new Date(article.created_at).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    author: article.author,
    category: article.category,
    readTime: article.read_time,
    image: article.image_url || "/placeholder.svg",
    content: article.content,
    relatedPosts: relatedArticles,
  }

  // Generate structured data for SEO (Fully connected @graph)
  const articleStructuredDataGraph = generateArticleStructuredDataGraph(article)

  return (
    <>
      <StructuredData data={articleStructuredDataGraph} />
      <BlogPostContent post={post} article={article} preloadedProducts={preloadedProducts} />
    </>
  )
}
