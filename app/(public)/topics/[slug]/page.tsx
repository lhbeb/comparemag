import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Logo } from "@/components/logo"
import { Github, Linkedin, Mail, Rss, Twitter, BrainCircuit, Clock, ArrowLeft } from "lucide-react"
import { getAllArticles } from "@/lib/supabase/articles"
import { SupabaseImage } from "@/components/supabase-image"
import { format } from "date-fns"
import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import { StructuredData } from "@/components/seo/structured-data"
import type { Metadata } from "next"
import { absoluteUrl, SITE_NAME } from '@/lib/site-config'

type TopicConfig = {
  title: string
  description: string
  matchCategories: readonly string[]
  mode?: "all"
}

const topicsData: Record<string, TopicConfig> = {
  "smartphones": {
    title: "Smartphones",
    description: "In-depth reviews, comparisons, and news on the latest iOS and Android smartphones.",
    matchCategories: ["smartphones"],
  },
  "laptops": {
    title: "Laptops & PCs",
    description: "Find the best laptops for work, gaming, and everyday use with our bench-tested reviews.",
    matchCategories: ["laptops", "pcs"],
  },
  "audio": {
    title: "Audio & Headphones",
    description: "Clear sound matters. We test the latest wireless earbuds, headsets, and speakers.",
    matchCategories: ["audio", "headphones"],
  },
  "home-appliances": {
    title: "Home Appliances",
    description: "Smart home devices, vacuums, and kitchen tech compared and reviewed.",
    matchCategories: ["home appliances", "home"],
  },
  "gaming": {
    title: "Gaming",
    description: "Consoles, accessories, and gaming monitors put to the test.",
    matchCategories: ["gaming"],
  },
  "cameras": {
    title: "Cameras",
    description: "From beginner mirrorless to professional gear, we review the top photography tech.",
    matchCategories: ["cameras", "camera"],
  },
  "trending": {
    title: "Trending",
    description: "What readers are watching most right now across reviews, buying guides, and price-driven stories.",
    matchCategories: ["smartphones", "laptops", "audio", "gaming", "cameras", "news", "deals", "price comparison", "buying guide"],
    mode: "all",
  },
  "tech": {
    title: "Tech",
    description: "Broad coverage across gadgets, consumer tech, reviews, and product news.",
    matchCategories: ["smartphones", "laptops", "audio", "gaming", "cameras", "wearables", "tvs", "displays", "news"],
  },
  "innovation": {
    title: "Innovation",
    description: "Future-facing product news, launches, and emerging consumer technology.",
    matchCategories: ["news", "wearables", "smartphones", "cameras", "gaming"],
  },
  "business": {
    title: "Business",
    description: "Price shifts, value analysis, comparisons, and buying decisions that affect real shoppers.",
    matchCategories: ["price comparison", "deals", "buying guide", "laptops", "smartphones"],
  },
  "security": {
    title: "Security",
    description: "Coverage of privacy, product safety, trust signals, and smarter device decisions.",
    matchCategories: ["news", "buying guide", "smartphones", "home appliances"],
  },
  "advice": {
    title: "Advice",
    description: "Practical buying guides, recommendations, and hands-on advice for better tech purchases.",
    matchCategories: ["buying guide", "price comparison", "deals"],
  },
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> | { slug: string } }): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params)
  const topic = topicsData[resolvedParams.slug as keyof typeof topicsData]

  if (!topic) return {}

  return {
    title: `${topic.title} Reviews & News | ${SITE_NAME}`,
    description: topic.description,
    openGraph: {
      title: `${topic.title} Reviews & News | ${SITE_NAME}`,
      description: topic.description,
      type: "website",
      url: absoluteUrl(`/topics/${resolvedParams.slug}`),
    },
  }
}

export async function generateStaticParams() {
  return Object.keys(topicsData).map((slug) => ({ slug }))
}

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  const resolvedParams = await Promise.resolve(params)
  const topic = topicsData[resolvedParams.slug as keyof typeof topicsData]

  if (!topic) {
    notFound()
  }

  const allArticles = await getAllArticles(true)

  const categoryArticles = topic.mode === "all"
    ? allArticles
    : allArticles.filter((a) => {
        const normalized = a.category.toLowerCase()
        return topic.matchCategories.some((match) => normalized.includes(match))
      })

  const heroArticle = categoryArticles[0]
  const recentArticles = categoryArticles.slice(1)

  const breadcrumbItems = [
    { label: "Categories", href: "/topics" },
    { label: topic.title, href: `/topics/${resolvedParams.slug}` },
  ]

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${topic.title} Reviews & News | ${SITE_NAME}`,
    description: topic.description,
    url: absoluteUrl(`/topics/${resolvedParams.slug}`),
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: categoryArticles.map((article, index) => ({
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
      { '@type': 'ListItem', position: 2, name: 'Categories', item: absoluteUrl('/topics') },
      { '@type': 'ListItem', position: 3, name: topic.title, item: absoluteUrl(`/topics/${resolvedParams.slug}`) }
    ]
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <StructuredData data={[schemaData, breadcrumbSchema]} />
      <main className="container mx-auto px-4 py-8">
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="py-8 mb-8 border-b border-slate-200">
          <Link href="/topics" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-blue-600 mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to all categories
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">{topic.title}</h1>
          <p className="text-xl text-slate-600 max-w-3xl">{topic.description}</p>
        </div>

        {categoryArticles.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
            No articles published in this category yet.
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Featured Post */}
            {heroArticle && (
             <div className="lg:col-span-8">
               <h2 className="text-2xl font-bold mb-6 flex items-center text-slate-900 border-b border-slate-200 pb-2">
                 Featured Guide
               </h2>
               <Link href={`/blog/${heroArticle.slug}`} className="group block mb-12">
                 <div className="relative h-[300px] sm:h-[400px] w-full rounded-2xl overflow-hidden mb-6 border border-slate-200 shadow-sm">
                   <SupabaseImage
                     src={heroArticle.image_url || "/placeholder.svg"}
                     alt={heroArticle.title}
                     fill
                     className="object-cover transition-transform duration-500 group-hover:scale-105"
                     priority
                   />
                 </div>
                 <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 mb-3 uppercase tracking-wider">
                   <BrainCircuit className="h-5 w-5" />
                   <span>{heroArticle.category}</span>
                 </div>
                 <h3 className="text-3xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors line-clamp-2">
                   {heroArticle.title}
                 </h3>
                 <p className="text-slate-600 text-lg line-clamp-3 mb-4">
                   {heroArticle.content.replace(/<[^>]*>/g, '').substring(0, 250)}...
                 </p>
                 <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                   <span>By {heroArticle.author}</span>
                   <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {format(new Date(heroArticle.created_at), 'MMMM d, yyyy')}</span>
                 </div>
               </Link>
             </div>
            )}

            {/* Sidebar Posts */}
            <div className="lg:col-span-4">
              <h2 className="text-lg font-bold mb-6 text-slate-900 border-b border-slate-200 pb-2">Latest in {topic.title}</h2>
              <div className="flex flex-col gap-8">
                {recentArticles.slice(0, 4).map((article) => (
                  <Link href={`/blog/${article.slug}`} key={article.id} className="group flex gap-4 items-start">
                    <div className="relative w-24 h-24 sm:w-32 sm:h-24 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200">
                      <SupabaseImage
                        src={article.image_url || "/placeholder.svg"}
                        alt={article.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug group-hover:text-blue-600 transition-colors line-clamp-3 mb-2">
                        {article.title}
                      </h4>
                      <div className="text-xs text-slate-500 font-medium">
                        {format(new Date(article.created_at), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      
    </div>
  )
}
