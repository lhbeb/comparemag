import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, Laptop, Speaker, Home, Gamepad2, Camera } from "lucide-react"
import { getAllArticles } from "@/lib/supabase/articles"
import { StructuredData } from "@/components/seo/structured-data"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Categories & Topics | CompareMag",
  description: "Browse our comprehensive coverage of smartphones, laptops, audio gear, home appliances, gaming, and cameras.",
  alternates: {
    canonical: "https://comparemag.blog/topics",
  },
  openGraph: {
    title: "Categories & Topics | CompareMag",
    description: "Browse our comprehensive coverage of smartphones, laptops, audio gear, home appliances, gaming, and cameras.",
    url: "https://comparemag.blog/topics",
    siteName: "CompareMag",
    type: "website",
  },
}

const topicsTemplate = [
  {
    title: "Smartphones",
    description: "In-depth reviews, comparisons, and news on the latest iOS and Android smartphones.",
    icon: <Phone className="h-6 w-6" />,
    slug: "smartphones",
  },
  {
    title: "Laptops & PCs",
    description: "Find the best laptops for work, gaming, and everyday use with our bench-tested reviews.",
    icon: <Laptop className="h-6 w-6" />,
    slug: "laptops",
  },
  {
    title: "Audio & Headphones",
    description: "Clear sound matters. We test the latest wireless earbuds, headsets, and speakers.",
    icon: <Speaker className="h-6 w-6" />,
    slug: "audio",
  },
  {
    title: "Home Appliances",
    description: "Smart home devices, vacuums, and kitchen tech compared and reviewed.",
    icon: <Home className="h-6 w-6" />,
    slug: "home-appliances",
  },
  {
    title: "Gaming",
    description: "Consoles, accessories, and gaming monitors put to the test.",
    icon: <Gamepad2 className="h-6 w-6" />,
    slug: "gaming",
  },
  {
    title: "Cameras",
    description: "From beginner mirrorless to professional gear, we review the top photography tech.",
    icon: <Camera className="h-6 w-6" />,
    slug: "cameras",
  },
]

export default async function TopicsPage() {
  const articles = await getAllArticles(true)
  
  // Calculate real article counts per category using fuzzy matching like on the detail page
  const categoryCounts = topicsTemplate.map(topic => {
    const matchCount = articles.filter(a => {
      const isExact = a.category.toLowerCase() === topic.title.toLowerCase()
      const isFuzzy = a.category.toLowerCase().includes(topic.title.split(' ')[0].toLowerCase())
      return isExact || isFuzzy
    }).length
    
    return {
      ...topic,
      count: matchCount
    }
  })

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Categories & Topics | CompareMag',
    description: 'Browse our comprehensive coverage of tech categories.',
    url: 'https://comparemag.blog/topics',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: categoryCounts.map((topic, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Thing',
          name: topic.title,
          description: topic.description,
          url: `https://comparemag.blog/topics/${topic.slug}`
        }
      }))
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <StructuredData data={schemaData} />
      <main className="container mx-auto px-4 py-12">
        <section className="mb-12">
          <h1 className="text-4xl font-bold mb-8 text-slate-900">Categories</h1>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryCounts.map((topic, index) => (
              <TopicCard
                key={index}
                title={topic.title}
                description={topic.description}
                icon={topic.icon}
                count={topic.count}
                slug={topic.slug}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

function TopicCard({ title, description, icon, count, slug = "" }: any) {
  return (
    <Link href={`/topics/${slug}`} className="group">
      <Card className="bg-white border-gray-200 hover:border-blue-300 transition-colors h-full shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="bg-blue-50 p-3 rounded-lg text-blue-600">{icon}</div>
            <div className="bg-gray-100 px-3 py-1 rounded-full text-sm text-slate-600 font-medium">{count} items</div>
          </div>
          <CardTitle className="text-xl mt-4 text-slate-900 group-hover:text-blue-600 transition-colors">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-slate-600">{description}</CardDescription>
        </CardContent>
        <CardFooter>
          <span className="text-blue-600 font-medium text-sm group-hover:text-blue-700 transition-colors">View articles →</span>
        </CardFooter>
      </Card>
    </Link>
  )
}
