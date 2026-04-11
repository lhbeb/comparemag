import { getArticleBySlug, getAllSlugs, getAllArticles } from "@/lib/supabase/articles"
import { BlogPostContent } from "@/components/blog-post-content"
import { notFound } from "next/navigation"
import type { BlogPost } from "@/lib/data/blogPosts"
import { generateArticleMetadata, generateArticleStructuredData, generateBreadcrumbStructuredData, generateOrganizationStructuredData } from "@/lib/seo/article-seo"
import { StructuredData } from "@/components/seo/structured-data"
import { parseProductShortcodes } from "@/lib/products/embed"
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
  const relatedArticles = allArticles
    .filter(a => a.category === article.category && a.slug !== article.slug)
    .map(a => ({
      title: a.title,
      slug: a.slug,
      image: a.image_url || "/placeholder.svg",
      category: a.category,
    }))

  // Convert Supabase article to BlogPost format
  const parsedContent = await parseProductShortcodes(article.content)
  
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
    content: parsedContent,
    relatedPosts: relatedArticles,
  }

  // Generate structured data for SEO
  const articleStructuredData = generateArticleStructuredData(article)
  const breadcrumbStructuredData = generateBreadcrumbStructuredData(article)
  const organizationStructuredData = generateOrganizationStructuredData()

  return (
    <>
      <StructuredData data={[articleStructuredData, breadcrumbStructuredData, organizationStructuredData]} />
      <BlogPostContent post={post} article={article} />
    </>
  )
}
