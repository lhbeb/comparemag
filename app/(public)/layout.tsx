import type React from "react"
import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { getAllArticles } from "@/lib/supabase/articles"

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const articles = await getAllArticles(true)
  const featured = articles.find((a: any) => a.is_featured === true)

  return (
    <>
      <div className="bg-[#0D1321] py-2.5 px-4 w-full flex justify-center">
        {featured ? (
          <Link href={`/blog/${featured.slug}`} className="inline-flex items-center gap-2 group transition-colors">
            <Sparkles className="h-4 w-4 flex-shrink-0 text-orange-500 group-hover:scale-110 transition-transform" />
            <span className="text-white text-xs sm:text-sm font-bold leading-none">
              Featured: {featured.title.length > 50 ? featured.title.slice(0, 50) + "..." : featured.title}
            </span>
            <ArrowRight className="h-4 w-4 flex-shrink-0 text-orange-500 group-hover:translate-x-0.5 transition-transform ml-1" />
          </Link>
        ) : (
          <Link href="#" className="inline-flex items-center gap-2 group transition-colors">
            <ArrowRight className="h-4 w-4 flex-shrink-0 text-orange-500 group-hover:translate-x-0.5 transition-transform" />
            <span className="text-white text-xs sm:text-sm font-bold leading-none">Tomorrow belongs to those who embrace it today</span>
          </Link>
        )}
      </div>
      <SiteHeader />
      <div className="flex-1">
        {children}
      </div>
      <SiteFooter />
    </>
  )
}
