import type React from "react"
import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { getAllArticles } from "@/lib/supabase/articles"

import { PromoBarCarousel } from "@/components/promo-bar-carousel"
import { CookieConsent } from "@/components/cookie-consent"

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const articles = await getAllArticles(true)
  const featured = articles.filter((a: any) => a.is_featured === true)

  return (
    <>
      <div className="bg-[#0D1321] py-2.5 px-4 w-full flex justify-center z-50 relative border-b border-indigo-950/50 shadow-[0_2px_10px_rgba(0,0,0,0.2)]">
        <PromoBarCarousel features={featured} />
      </div>
      <SiteHeader />
      <div className="flex-1">
        {children}
      </div>
      <SiteFooter />
      <CookieConsent />
    </>
  )
}
