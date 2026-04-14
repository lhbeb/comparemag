import React from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Star, TrendingUp, Tag, Github, Linkedin, Mail, Rss, Twitter, BarChart3, Newspaper, User, Award } from "lucide-react"
import { LazyFeaturedCard } from "@/components/lazy-featured-card"
import { LazyArticleCard } from "@/components/lazy-article-card"
import { Logo } from "@/components/logo"
import { NewsletterForm } from "@/components/newsletter-form"
import { getAllArticles } from "@/lib/supabase/articles"
import { getAllWriters } from "@/lib/supabase/writers"

export default async function Home() {
  const rawArticles = await getAllArticles(true).catch(() => [])
  const editors = await getAllWriters().catch(() => [])

  // Format articles to match the expected schema
  const articles = rawArticles.map(article => ({
    slug: article.slug,
    title: article.title,
    description: article.content.replace(/<[^>]*>/g, '').substring(0, 200).trim() + '...',
    category: article.category,
    date: new Date(article.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    image: article.image_url || '/placeholder.svg'
  }))

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <main className="container mx-auto px-4 pt-6 pb-16 overflow-visible">
        {/* Hero */}
        <section className="hero-section mb-0 rounded-t-[2rem] rounded-b-none p-8 md:p-12 lg:p-16 shadow-2xl overflow-hidden relative">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center relative z-10">
            <div className="space-y-6 lg:space-y-8">
              <h1 className="text-5xl md:text-6xl lg:text-[4.2rem] font-extrabold leading-[1.05] tracking-tight break-words text-white">
                Real Reviews. Best Prices. Smart Choices.
              </h1>
              <p className="text-lg text-white/80 leading-relaxed font-medium max-w-xl">
                In-depth product reviews, breaking consumer news, and side-by-side price comparisons so you always buy better.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button className="bg-orange-600 hover:bg-orange-700 text-white w-full sm:w-auto h-11 px-7 text-base font-bold shadow-lg transition-all rounded-full" asChild>
                  <Link href="/articles/">Latest Reviews</Link>
                </Button>
                <Button
                  variant="outline"
                  className="bg-white/10 border-2 border-white/30 hover:bg-white hover:text-blue-900 text-white w-full sm:w-auto h-11 px-7 text-base font-semibold backdrop-blur-md transition-all rounded-full"
                  asChild
                >
                  <Link href="#newsletter">Join Newsletter</Link>
                </Button>
              </div>
            </div>
            <div className="relative h-[260px] sm:h-[340px] lg:h-[400px] rounded-xl overflow-hidden bg-white">
              <Image
                src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1200&h=800&auto=format&fit=crop"
                alt="Shopping and product comparison concept"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                quality={85}
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{ background: 'linear-gradient(to bottom, transparent 0%, transparent 40%, rgba(40, 70, 140, 0.7) 70%, rgba(40, 70, 140, 1) 95%, rgba(40, 70, 140, 1) 100%)' }}
              />
            </div>
          </div>
        </section>

        {/* Featured Reviews */}
        <section className="featured-reviews-section relative mb-16 md:mb-24 bg-white rounded-t-none rounded-b-3xl p-6 md:p-10 lg:p-12 shadow-[0_8px_48px_hsl(221_78%_42%/0.12),0_2px_12px_hsl(0_0%_0%/0.06)] border border-slate-200/80">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-8 sm:mb-10">
            <div className="section-heading">
              <h2 className="text-3xl md:text-[2.5rem] leading-tight tracking-tight font-bold text-slate-900">Featured Reviews</h2>
            </div>
            <Link href="/articles/" className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-900 hover:text-slate-700 transition-colors">
              View all reviews →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {articles.length === 0 ? (
              <div className="col-span-1 sm:col-span-2 lg:col-span-4 text-center py-8 text-gray-600">No articles yet</div>
            ) : (
              articles.slice(0, 4).map((article) => {
                const iconMap: Record<string, React.ReactElement> = {
                  "Electronics": <ShoppingBag className="h-5 w-5" />,
                  "Smartphones": <ShoppingBag className="h-5 w-5" />,
                  "Laptops": <TrendingUp className="h-5 w-5" />,
                  "Audio": <Star className="h-5 w-5" />,
                  "Deals": <Tag className="h-5 w-5" />,
                  "News": <Newspaper className="h-5 w-5" />,
                  "Comparisons": <BarChart3 className="h-5 w-5" />,
                }
                return (
                  <LazyFeaturedCard
                    key={article.slug}
                    title={article.title}
                    description={article.description}
                    image={article.image}
                    date={article.date}
                    category={article.category}
                    icon={iconMap[article.category] || <ShoppingBag className="h-5 w-5" />}
                    slug={article.slug}
                  />
                )
              })
            )}
          </div>
        </section>

        {/* Meet the Experts */}
        {editors.length > 0 && (
          <section className="mb-16 md:mb-24">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10 gap-4">
              <div className="section-heading max-w-2xl">
                <div>
                  <h2 className="text-3xl md:text-[2.5rem] leading-tight tracking-tight font-bold text-slate-900 mb-3">Meet the Experts</h2>
                  <p className="text-slate-500 text-base mt-2 leading-relaxed max-w-2xl">
                    Our editors believe in innovation that helps you succeed in work and life. They research and review so you can move forward today.
                  </p>
                </div>
              </div>
              <Link href="/about/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900 hover:text-slate-700 transition-colors whitespace-nowrap">
                see all experts →
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {editors.map((editor) => (
                <div key={editor.id} className="expert-card">
                  <div className="expert-card-photo">
                    {editor.avatar_url ? (
                      <img src={editor.avatar_url} alt={editor.name} />
                    ) : (
                      <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                        <User className="h-16 w-16 text-blue-400" />
                      </div>
                    )}
                    <div className="expert-card-photo-overlay" />
                    <div className="expert-card-photo-name">
                      {editor.specialty && (
                        <span className="expert-card-badge mb-2 block w-fit">
                          <Award className="h-3 w-3 inline-block mr-1" />
                          {editor.specialty}
                        </span>
                      )}
                      <h3>{editor.name}</h3>
                    </div>
                  </div>
                  <div className="expert-card-body">
                    {editor.bio && (
                      <p className="expert-card-bio line-clamp-3">{editor.bio}</p>
                    )}
                    <Link href={`/writers/${editor.slug}`} className="expert-card-link">
                      Full bio & credentials →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recent Reviews & News */}
        <section className="mb-16 md:mb-24">
          <div className="section-heading mb-10">
            <h2 className="text-3xl md:text-[2.5rem] leading-tight tracking-tight font-bold text-slate-900">Recent Reviews & News</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.slice(3, 9).map((article) => (
              <LazyArticleCard
                key={article.slug}
                title={article.title}
                description={article.description}
                category={article.category}
                date={article.date}
                slug={article.slug}
                image={article.image}
              />
            ))}
          </div>
        </section>

        {/* Newsletter */}
        <section
          id="newsletter"
          className="newsletter-section mb-12 sm:mb-16 p-8 sm:p-12 md:p-16"
        >
          <div className="relative z-10 grid md:grid-cols-2 gap-6 md:gap-12 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-orange-300 text-xs font-semibold uppercase tracking-widest mb-2">
                🔔 Newsletter
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">Never Miss a Deal</h2>
              <p className="text-blue-200 leading-relaxed">
                Get the latest reviews, price drop alerts, and exclusive buying guides delivered straight to your inbox.
              </p>
            </div>
            <NewsletterForm />
          </div>
        </section>
      </main>

      
    </div>
  )
}
