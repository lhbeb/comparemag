import Link from "next/link"
import Image from "next/image"
import { SupabaseImage } from "@/components/supabase-image"
import { Logo } from "@/components/logo"
import { BrainCircuit, Clock, Github, Linkedin, Mail, Rss, Twitter } from "lucide-react"
import { getAllArticles } from "@/lib/supabase/articles"
import { format } from 'date-fns'
import { ArticlesSubscribeButton } from '@/components/articles-subscribe-button'
import { StructuredData } from '@/components/seo/structured-data'
import type { Metadata } from 'next'
import { absoluteUrl, SITE_NAME } from '@/lib/site-config'

export const metadata: Metadata = {
  title: `All Reviews & Articles | ${SITE_NAME}`,
  description: "Browse our complete archive of in-depth product reviews, buying guides, and tech news.",
  alternates: {
    canonical: absoluteUrl('/articles'),
  },
  openGraph: {
    title: `All Reviews & Articles | ${SITE_NAME}`,
    description: "Browse our complete archive of in-depth product reviews, buying guides, and tech news.",
    siteName: SITE_NAME,
    url: absoluteUrl('/articles'),
    type: "website",
  },
}

async function getArticles() {
  try {
    return await getAllArticles(true) // Get only published articles
  } catch (error) {
    console.error('Error fetching articles:', error)
    return []
  }
}

export default async function ArticlesPage() {
  const articles = await getArticles()

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `All Reviews & Articles | ${SITE_NAME}`,
    description: 'Browse our complete archive of in-depth product reviews, buying guides, and tech news.',
    url: absoluteUrl('/articles'),
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: articles.map((article, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Article',
          name: article.title,
          url: absoluteUrl(`/blog/${article.slug}`),
          datePublished: article.published_at || article.created_at,
          author: {
            '@type': 'Person',
            name: article.author
          }
        }
      }))
    }
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
      { '@type': 'ListItem', position: 2, name: 'Articles', item: absoluteUrl('/articles') }
    ]
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <StructuredData data={[schemaData, breadcrumbSchema]} />
      <main className="container mx-auto px-4 py-12">
        <section className="mb-12">
          <h1 className="text-4xl font-bold mb-8 text-slate-900">All Reviews</h1>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => {
              const description = article.content
                .replace(/<[^>]*>/g, "")
                .substring(0, 200)
                .trim() + "..."
              
              return (
                <ArticleCard
                  key={article.id}
                  title={article.title}
                  description={description}
                  category={article.category}
                  date={format(new Date(article.created_at), 'MMMM d, yyyy')}
                  slug={article.slug}
                  image={article.image_url || "/placeholder.svg"}
                />
              )
            })}
          </div>
        </section>
      </main>

      
    </div>
  )
}

function ArticleCard({ title, description, category, date, slug = "", image }: any) {
  return (
    <Link href={`/blog/${slug}/`} className="group">
      <div className="space-y-3">
        <div className="relative h-48 rounded-lg overflow-hidden border border-gray-200 group-hover:border-blue-300 transition-colors shadow-sm group-hover:shadow-md">
          <SupabaseImage src={image || "/placeholder.svg"} alt={`${title} thumbnail`} fill className="object-cover" />
        </div>
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-600 mb-2 font-medium min-w-0">
            <BrainCircuit className="h-4 w-4" />
            <span>{category}</span>
          </div>
          <h3 className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors break-words line-clamp-2">{title}</h3>
          <p className="text-slate-600 text-sm mt-2 line-clamp-2">{description}</p>
          <div className="flex items-center gap-1 mt-3 text-xs text-slate-500 min-w-0">
            <Clock className="h-3 w-3" />
            <span>{date}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
