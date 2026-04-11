"use client"

import React, { useState, useRef, useEffect, type FormEvent, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ShoppingBag, Star, TrendingUp, Tag, Github, Linkedin, Mail, Rss, Search, Twitter, BarChart3, Newspaper, User, Award, Menu, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { LazySearchBar } from "@/components/lazy-search-bar"
import { LazyFeaturedCard } from "@/components/lazy-featured-card"
import { LazyArticleCard } from "@/components/lazy-article-card"
import { Logo } from "@/components/logo"

export default function Home() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editors, setEditors] = useState<any[]>([])
  const [editorsLoading, setEditorsLoading] = useState(true)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { toast } = useToast()
  const newsletterRef = useRef<HTMLElement>(null)

  // Fetch articles on mount with optimized caching
  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    async function fetchArticles() {
      try {
        // Small delay to ensure page is fully loaded
        await new Promise(resolve => setTimeout(resolve, 100))

        if (!isMounted) return

        // Use absolute URL in development to avoid fetch issues
        const apiUrl = typeof window !== 'undefined'
          ? `${window.location.origin}/api/articles/list`
          : '/api/articles/list'

        console.log('Fetching articles from:', apiUrl)

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          cache: 'default',
          signal: controller.signal,
        })

        if (!isMounted) return

        if (!response.ok) {
          const text = await response.text().catch(() => 'Unable to read error response')
          console.error('API error:', response.status, text.substring(0, 200))
          throw new Error(`Failed to fetch articles: ${response.status} ${response.statusText}`)
        }

        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text().catch(() => 'Unable to read response')
          console.error('Response is not JSON:', text.substring(0, 200))
          throw new Error('Response is not JSON')
        }

        const data = await response.json()

        if (!isMounted) return

        // Handle both array and object with articles property
        const articlesArray = Array.isArray(data) ? data : (data?.articles || [])
        setArticles(articlesArray)
        setLoading(false)
      } catch (err: any) {
        if (!isMounted) return

        if (err.name === 'AbortError') {
          return // Request was aborted, ignore
        }

        // More detailed error logging
        if (err instanceof TypeError && err.message === 'Failed to fetch') {
          console.error('Network error - API route may not be accessible')
          console.error('This usually means:')
          console.error('1. The dev server is not running')
          console.error('2. The API route does not exist')
          console.error('3. There is a network/CORS issue')
        } else {
          console.error('Error fetching articles:', err)
        }

        console.error('Error details:', {
          name: err.name,
          message: err.message,
          stack: err.stack,
        })

        // Set empty array on error to prevent crashes
        setArticles([])
        setLoading(false)

        // Show toast notification with helpful message
        const errorMessage = err instanceof TypeError && err.message === 'Failed to fetch'
          ? 'Unable to connect to the server. Please ensure the dev server is running and try again.'
          : (err.message || 'Could not fetch articles from the server. Please check your connection and try again.')

        toast({
          title: 'Failed to load articles',
          description: errorMessage,
          variant: 'destructive',
        })
      }
    }

    fetchArticles()

    // Cleanup function
    return () => {
      isMounted = false
      controller.abort()
    }
  }, [toast])

  // Fetch editors for Meet the Experts section
  useEffect(() => {
    async function fetchEditors() {
      try {
        const res = await fetch('/api/writers')
        if (res.ok) {
          const data = await res.json()
          setEditors(Array.isArray(data) ? data : [])
        }
      } catch (e) {
        console.error('Failed to load editors', e)
      } finally {
        setEditorsLoading(false)
      }
    }
    fetchEditors()
  }, [])

  const scrollToNewsletter = () => {
    newsletterRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSubscribe = async (e: FormEvent) => {
    e.preventDefault()

    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simulate subscription process
    setTimeout(() => {
      toast({
        title: "Subscription successful!",
        description: "Thank you for subscribing to our newsletter.",
      })
      setEmail("")
      setIsSubmitting(false)
    }, 1000)

    // For GitHub Pages, you could use a service like Formspree or a Google Form
    // to collect emails without needing a backend
    // Example: window.open(`https://formspree.io/f/yourformid?email=${encodeURIComponent(email)}`, '_blank')
  }

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
                <Button className="bg-orange-600 hover:bg-orange-700 text-white w-full sm:w-auto h-11 px-7 text-base font-bold shadow-lg transition-all rounded-full">
                  <Link href="/articles/">Latest Reviews</Link>
                </Button>
                <Button
                  variant="outline"
                  className="bg-white/10 border-2 border-white/30 hover:bg-white hover:text-blue-900 text-white w-full sm:w-auto h-11 px-7 text-base font-semibold backdrop-blur-md transition-all rounded-full"
                  onClick={scrollToNewsletter}
                >
                  Join Newsletter
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
              {/* Fade image into the section background */}
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
            {loading ? (
              <div className="col-span-1 sm:col-span-2 lg:col-span-4 text-center py-8 text-gray-600">Loading articles...</div>
            ) : articles.length === 0 ? (
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
        {(editorsLoading || editors.length > 0) && (
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
              {editorsLoading ? (
                [1,2,3].map((i) => (
                  <div key={i} className="expert-card animate-pulse">
                    <div className="expert-card-photo skeleton" />
                    <div className="expert-card-body gap-3">
                      <div className="skeleton h-4 w-3/4 rounded" />
                      <div className="skeleton h-3 w-full rounded" />
                      <div className="skeleton h-3 w-5/6 rounded" />
                    </div>
                  </div>
                ))
              ) : (
                editors.map((editor) => (
                  <div key={editor.id} className="expert-card">
                    {/* Photo panel */}
                    <div className="expert-card-photo">
                      {editor.avatar_url ? (
                        <img src={editor.avatar_url} alt={editor.name} />
                      ) : (
                        <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                          <User className="h-16 w-16 text-blue-400" />
                        </div>
                      )}
                      {/* dark gradient */}
                      <div className="expert-card-photo-overlay" />
                      {/* name + badge pinned to bottom of photo */}
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

                    {/* Body */}
                    <div className="expert-card-body">
                      {editor.bio && (
                        <p className="expert-card-bio line-clamp-3">{editor.bio}</p>
                      )}
                      <Link href={`/writers/${editor.slug}`} className="expert-card-link">
                        Full bio & credentials →
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* Recent Reviews & News */}
        <section className="mb-16 md:mb-24">
          <div className="section-heading mb-10">
            <h2 className="text-3xl md:text-[2.5rem] leading-tight tracking-tight font-bold text-slate-900">Recent Reviews & News</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              <div className="col-span-3 text-center py-10 text-gray-600">Loading articles...</div>
            ) : articles.length === 0 ? (
              <div className="col-span-3 text-center py-10 text-gray-600">No articles yet</div>
            ) : (
              articles.slice(3).map((article) => (
                <LazyArticleCard
                  key={article.slug}
                  title={article.title}
                  description={article.description}
                  category={article.category}
                  date={article.date}
                  slug={article.slug}
                  image={article.image}
                />
              ))
            )}
          </div>
        </section>

        {/* CompareMag Recommends */}
        <section className="mb-16 md:mb-24">
          <div className="section-heading mb-10">
            <h2 className="text-3xl md:text-[2.5rem] leading-tight tracking-tight font-bold text-slate-900">CompareMag Recommends</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              <div className="col-span-3 text-center py-10 text-gray-600">Loading articles...</div>
            ) : articles.length === 0 ? (
              <div className="col-span-3 text-center py-10 text-gray-600">No articles yet</div>
            ) : (
              // Reusing a slightly shifted slice for demonstration
              articles.slice(1, 4).map((article) => (
                <LazyArticleCard
                  key={`recommend-${article.slug}`}
                  title={article.title}
                  description={article.description}
                  category={article.category}
                  date={article.date}
                  slug={article.slug}
                  image={article.image}
                />
              ))
            )}
          </div>
        </section>

        {/* CompareMag In Depth */}
        <section className="mb-16 md:mb-24">
          <div className="section-heading mb-10">
            <h2 className="text-3xl md:text-[2.5rem] leading-tight tracking-tight font-bold text-slate-900">CompareMag In Depth</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              <div className="col-span-3 text-center py-10 text-gray-600">Loading articles...</div>
            ) : articles.length === 0 ? (
              <div className="col-span-3 text-center py-10 text-gray-600">No articles yet</div>
            ) : (
              // Reusing a slightly shifted slice for demonstration
              articles.slice(2, 5).map((article) => (
                <LazyArticleCard
                  key={`indepth-${article.slug}`}
                  title={article.title}
                  description={article.description}
                  category={article.category}
                  date={article.date}
                  slug={article.slug}
                  image={article.image}
                />
              ))
            )}
          </div>
        </section>

        {/* Newsletter */}
        <section
          ref={newsletterRef}
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
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="your@email.com"
                className="h-12 sm:h-14 text-base px-6 bg-white/10 border-white/30 text-white placeholder:text-blue-200 focus-visible:bg-white/20 focus-visible:ring-white/30 flex-1 rounded-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button
                type="submit"
                className="h-12 sm:h-14 text-base px-8 bg-orange-600 hover:bg-orange-700 whitespace-nowrap text-white w-full sm:w-auto font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 rounded-full transition-all"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Subscribing..." : "Subscribe Free"}
              </Button>
            </form>
          </div>
        </section>
      </main>

      <footer className="site-footer py-14">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6 md:gap-8">
            <div className="space-y-4">
              <Logo width={140} height={40} />
              <p className="text-gray-400 text-sm">
                Your trusted source for unbiased product reviews, price comparisons, and the latest consumer tech news.
              </p>
              <div className="flex space-x-4">
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="h-5 w-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Github className="h-5 w-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Linkedin className="h-5 w-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Rss className="h-5 w-5" />
                </Link>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-4 text-white">Categories</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/topics/" className="hover:text-white transition-colors">
                    Smartphones
                  </Link>
                </li>
                <li>
                  <Link href="/topics/" className="hover:text-white transition-colors">
                    Laptops & PCs
                  </Link>
                </li>
                <li>
                  <Link href="/topics/" className="hover:text-white transition-colors">
                    Audio & Headphones
                  </Link>
                </li>
                <li>
                  <Link href="/topics/" className="hover:text-white transition-colors">
                    Home Appliances
                  </Link>
                </li>
                <li>
                  <Link href="/topics/" className="hover:text-white transition-colors">
                    Gaming
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4 text-white">Useful Links</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/articles/" className="hover:text-white transition-colors">
                    All Reviews
                  </Link>
                </li>
                <li>
                  <Link href="/articles/" className="hover:text-white transition-colors">
                    Price Comparisons
                  </Link>
                </li>
                <li>
                  <Link href="/articles/" className="hover:text-white transition-colors">
                    Best Deals
                  </Link>
                </li>
                <li>
                  <Link href="/articles/" className="hover:text-white transition-colors">
                    Buying Guides
                  </Link>
                </li>
                <li>
                  <Link href="/about/" className="hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4 text-white">Contact</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span className="break-all">ameyaudeshmukh@gmail.com</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-6 text-sm text-gray-400">
            <p>© {new Date().getFullYear()} CompareMag. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div >
  )
}

