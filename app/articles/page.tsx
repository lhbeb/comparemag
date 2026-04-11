import Link from "next/link"
import Image from "next/image"
import { SupabaseImage } from "@/components/supabase-image"
import { Logo } from "@/components/logo"
import { BrainCircuit, Clock, Github, Linkedin, Mail, Rss, Twitter } from "lucide-react"
import { getAllArticles } from "@/lib/supabase/articles"
import { format } from 'date-fns'
import { ArticlesSubscribeButton } from '@/components/articles-subscribe-button'

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

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">


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
