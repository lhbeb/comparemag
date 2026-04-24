import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Toaster } from "@/components/ui/toaster"
import SessionTracker from "@/components/SessionTracker"
import { DM_Sans } from "next/font/google"

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

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
    <html lang="en" className="overflow-x-hidden">
      <head>
        <link rel="dns-prefetch" href="https://fgkvrbdpmwyfjvpubzxn.supabase.co" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body className={`${dmSans.variable} font-sans flex flex-col min-h-screen overflow-x-hidden`}>
        {children}
        <Toaster />
        <SessionTracker />
      </body>
    </html>
  )
}
