import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Toaster } from "@/components/ui/toaster"
import localFont from "next/font/local"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

const monument = localFont({
  src: [
    {
      path: '../public/fonts/MonumentGrotesk-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/MonumentGrotesk-Italic.woff2',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../public/fonts/MonumentGrotesk-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/MonumentGrotesk-MediumItalic.woff2',
      weight: '500',
      style: 'italic',
    },
    {
      path: '../public/fonts/MonumentGrotesk-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../public/fonts/MonumentGrotesk-BoldItalic.woff2',
      weight: '700',
      style: 'italic',
    },
  ],
  variable: '--font-monument',
  display: 'swap',
  declarations: [
    { prop: 'ascent-override', value: '105%' },
    { prop: 'descent-override', value: '15%' },
    { prop: 'line-gap-override', value: '0%' },
  ],
})

import { SiteHeader } from "@/components/site-header"

export const metadata: Metadata = {
  title: "CompareMag - Product Reviews, News & Price Comparisons",
  description: "Your trusted source for in-depth product reviews, the latest tech and consumer news, and smart price comparisons to help you buy better.",
  generator: 'v0.app',
  icons: {
    icon: '/favicon.png',
  },
  other: {
    'format-detection': 'telephone=no',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="dns-prefetch" href="https://fgkvrbdpmwyfjvpubzxn.supabase.co" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body className={`${monument.variable} font-sans`}>
        <div className="bg-[#0D1321] py-2.5 px-4 w-full flex justify-center">
          <Link href="#" className="inline-flex items-center gap-2 group transition-colors">
            <ArrowRight className="h-4 w-4 flex-shrink-0 text-orange-500 group-hover:translate-x-0.5 transition-transform" />
            <span className="text-white text-xs sm:text-sm font-bold leading-none">Tomorrow belongs to those who embrace it today</span>
          </Link>
        </div>
        <SiteHeader />
        {children}
        <Toaster />
      </body>
    </html>
  )
}
