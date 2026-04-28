import Link from "next/link"
import Image from "next/image"
import { Logo } from "@/components/logo"
import { BookOpen, BrainCircuit, Clock, Twitter, Facebook, Linkedin, Rss, Mail, Github, User } from "lucide-react"
import type { BlogPost } from "@/lib/data/blogPosts"
import type { Article } from "@/lib/supabase/types"
import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import { ArticleShareButtons } from "@/components/article-share-buttons"
import { EmbedHydrator } from "@/components/embed-hydrator"
import { ArticleRenderer } from "@/components/article-renderer"
import type { ProductCardData } from "@/components/blocks/product-card-embed"
import { SupabaseImage } from "@/components/supabase-image"

interface BlogPostContentProps {
  post: BlogPost
  article?: Article
  preloadedProducts?: Record<string, ProductCardData>
  authorProfile?: {
    name: string
    slug: string
    avatarUrl: string | null
  }
}

export function BlogPostContent({ post, article, preloadedProducts, authorProfile }: BlogPostContentProps) {
  if (!post) return null

  const publishedDateTime = article?.published_at || article?.created_at || ''
  const authorHref = `/writers/${authorProfile?.slug || post.author.toLowerCase().replace(/\s+/g, '-')}`

  // Generate breadcrumb items
  const categorySlug = (post.category || 'General').toLowerCase().replace(/\s+/g, '-')
  
  const breadcrumbItems = [
    { label: 'Articles', href: '/articles' },
    { label: post.category || 'General', href: `/topics/${categorySlug}` },
  ]

  // Generate proper alt text for hero image
  const heroImageAlt = article?.image_url 
    ? `${post.title} - Featured image for article about ${post.category}`
    : 'Article hero image'

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <main className="container mx-auto px-4 py-12 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
          
          {/* Left Sidebar (Related Posts) */}
          {post.relatedPosts && post.relatedPosts.length > 0 && (
            <aside className="w-full lg:w-[300px] lg:sticky lg:top-28 flex-shrink-0 order-2 lg:order-1 pt-12 lg:pt-0">
              <h3 className="text-xl font-bold mb-6 text-slate-900 border-b border-slate-200 pb-2">Related</h3>
              <div className="flex flex-col gap-6">
                {post.relatedPosts.slice(0, 3).map((relatedPost, index) => (
                  <Link href={`/blog/${relatedPost.slug}/`} className="group flex flex-col gap-3" key={index}>
                    <div className="relative h-40 w-full rounded-xl overflow-hidden shadow-sm border border-slate-100">
                      <Image
                        src={relatedPost.image || "/placeholder.svg"}
                        alt={`${relatedPost.title} thumbnail`}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 mb-1.5 uppercase tracking-wider">
                        <BrainCircuit className="h-3 w-3" />
                        <span>{relatedPost.category}</span>
                      </div>
                      <h4 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
                        {relatedPost.title}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>
            </aside>
          )}

          {/* Main Article Content */}
          <div className="max-w-3xl w-full mx-auto order-1 lg:order-2 flex-grow">
            <Breadcrumbs items={breadcrumbItems} />

          <article itemScope itemType="https://schema.org/Article">
            {/* Article Header */}
            <header className="mb-8">
              <div className="flex items-center gap-2 text-sm text-blue-600 font-medium mb-4" itemProp="articleSection">
                <BrainCircuit className="h-5 w-5" aria-hidden="true" />
                <Link href={`/topics/${categorySlug}`} className="hover:underline">{post.category}</Link>
              </div>

              <h1 
                className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6 text-slate-900"
                itemProp="headline"
              >
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-8">
                <div className="flex items-center gap-1" itemProp="timeRequired">
                  <BookOpen className="h-4 w-4" aria-hidden="true" />
                  <span>{post.readTime}</span>
                </div>
                <div className="flex items-center gap-2.5" itemProp="author" itemScope itemType="https://schema.org/Person">
                  {authorProfile?.avatarUrl ? (
                    <span className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-blue-50">
                      <SupabaseImage
                        src={authorProfile.avatarUrl}
                        alt={authorProfile.name}
                        width={36}
                        height={36}
                        sizes="36px"
                        quality={72}
                        className="h-full w-full rounded-full object-cover"
                      />
                    </span>
                  ) : (
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 ring-2 ring-blue-50">
                      <User className="h-4 w-4 text-blue-600" aria-hidden="true" />
                    </span>
                  )}
                  {authorProfile?.avatarUrl && (
                    <meta itemProp="image" content={authorProfile.avatarUrl} />
                  )}
                  <span className="min-w-0">
                    <Link
                      href={authorHref}
                      itemProp="url"
                      className="font-semibold text-slate-700 transition-colors hover:text-blue-600 hover:underline"
                    >
                      <span itemProp="name">{authorProfile?.name || post.author}</span>
                    </Link>
                  </span>
                </div>
                {publishedDateTime && (
                  <meta itemProp="datePublished" content={publishedDateTime} />
                )}
                {article?.updated_at && article.updated_at !== article.created_at && (
                  <meta itemProp="dateModified" content={article.updated_at} />
                )}
              </div>

              {/* Hero Image with proper SEO */}
              <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 bg-slate-50 shadow-md">
                <div className="flex justify-center">
                  <img
                    src={post.image || "/placeholder.svg"}
                    alt={heroImageAlt}
                    className="block h-auto max-h-[78vh] w-auto max-w-full"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />
                </div>
              </div>
            </header>

            {/* Share island */}
            <ArticleShareButtons title={post.title} />

            {/* Article Content */}
            <div 
              className="prose prose-lg prose-slate max-w-none prose-a:text-blue-600 hover:prose-a:text-blue-800 prose-headings:text-slate-900 prose-img:rounded-xl [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-xl [&_iframe]:border-0 [&_iframe]:shadow-sm my-8"
              itemProp="articleBody"
            >
              <ArticleRenderer source={post.content} preloadedProducts={preloadedProducts} />
            </div>
            
            {/* Embed Runtime Hydrator */}
            <EmbedHydrator />

            {/* Article Footer */}
            <footer className="mt-12 pt-8 border-t border-slate-200">
              <div className="flex flex-wrap gap-2 mb-6 items-center">
                <span className="text-sm font-medium text-slate-700 mr-2">Tags:</span>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-semibold" itemProp="keywords">
                  {post.category}
                </span>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-full text-xs font-semibold">Review</span>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-full text-xs font-semibold">Tech</span>
              </div>
            </footer>
          </article>

          {post.relatedPosts && post.relatedPosts.length > 3 && (
            <div className="border-t border-slate-200 mt-12 pt-8">
              <h3 className="text-2xl font-bold mb-6 text-slate-900">Recommended Articles</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {post.relatedPosts.slice(3, 7).map((relatedPost, index) => (
                  <Link href={`/blog/${relatedPost.slug}/`} className="group block h-full" key={index}>
                    <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 h-full flex flex-col">
                      <div className="relative h-48 w-full flex-shrink-0">
                        <Image
                          src={relatedPost.image || "/placeholder.svg"}
                          alt={`${relatedPost.title} thumbnail`}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wider">
                          <BrainCircuit className="h-4 w-4" />
                          <span>{relatedPost.category}</span>
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {relatedPost.title}
                        </h3>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {publishedDateTime && (
            <div className="mt-12 border-t border-slate-200 pt-5 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                <time dateTime={publishedDateTime}>
                  Published {post.date}
                </time>
              </div>
            </div>
          )}
          </div>
        </div>
      </main>

      
    </div>
  )
}
