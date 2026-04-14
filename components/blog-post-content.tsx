import Link from "next/link"
import Image from "next/image"
import { SupabaseImage } from "@/components/supabase-image"
import { Logo } from "@/components/logo"
import { BrainCircuit, Clock, Twitter, Facebook, Linkedin, Rss, Mail, Github } from "lucide-react"
import type { BlogPost } from "@/lib/data/blogPosts"
import type { Article } from "@/lib/supabase/types"
import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import { ArticleShareButtons } from "@/components/article-share-buttons"

interface BlogPostContentProps {
  post: BlogPost
  article?: Article
}

export function BlogPostContent({ post, article }: BlogPostContentProps) {
  if (!post) return null

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
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  <time 
                    dateTime={article?.published_at || article?.created_at || ''} 
                    itemProp="datePublished"
                  >
                    {post.date}
                  </time>
                </div>
                <span itemProp="timeRequired">{post.readTime}</span>
                <div itemProp="author" itemScope itemType="https://schema.org/Person">
                  <span>By <Link href={`/writers/${post.author.toLowerCase().replace(/\s+/g, '-')}`} itemProp="url" className="font-semibold text-blue-600 hover:underline"><span itemProp="name">{post.author}</span></Link></span>
                </div>
                {article?.updated_at && article.updated_at !== article.created_at && (
                  <meta itemProp="dateModified" content={article.updated_at} />
                )}
              </div>

              {/* Hero Image with proper SEO */}
              <div className="relative h-[400px] md:h-[500px] rounded-xl overflow-hidden border border-gray-200 shadow-md mb-8">
                <SupabaseImage
                  src={post.image || "/placeholder.svg"}
                  alt={heroImageAlt}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                />
              </div>
            </header>

            {/* Share island */}
            <ArticleShareButtons title={post.title} />

            {/* Article Content */}
            <div 
              className="prose prose-lg prose-slate max-w-none prose-a:text-blue-600 hover:prose-a:text-blue-800 prose-headings:text-slate-900 prose-img:rounded-xl"
              itemProp="articleBody"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

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
          </div>
        </div>
      </main>

      <footer className="py-12 bg-slate-900 text-slate-300">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6 md:gap-8">
            <div className="space-y-4">
              <Logo width={140} height={40} />
              <p className="text-slate-400 text-sm">
                Your trusted source for unbiased product reviews, price comparisons, and the latest tech news.
              </p>
              <div className="flex space-x-4">
                <Link href="#" className="text-slate-400 hover:text-white transition-colors"><Twitter className="h-5 w-5" /></Link>
                <Link href="#" className="text-slate-400 hover:text-white transition-colors"><Github className="h-5 w-5" /></Link>
                <Link href="#" className="text-slate-400 hover:text-white transition-colors"><Linkedin className="h-5 w-5" /></Link>
                <Link href="#" className="text-slate-400 hover:text-white transition-colors"><Rss className="h-5 w-5" /></Link>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-4 text-white">Categories</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/topics/" className="hover:text-white transition-colors">Smartphones</Link></li>
                <li><Link href="/topics/" className="hover:text-white transition-colors">Laptops & PCs</Link></li>
                <li><Link href="/topics/" className="hover:text-white transition-colors">Audio & Headphones</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4 text-white">Useful Links</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/articles/" className="hover:text-white transition-colors">All Reviews</Link></li>
                <li><Link href="/about/" className="hover:text-white transition-colors">About Us</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4 text-white">Contact</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span className="break-all">ameyaudeshmukh@gmail.com</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-6 text-sm text-slate-500">
            <p>© {new Date().getFullYear()} CompareMag. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
