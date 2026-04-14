import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Toaster } from "@/components/ui/toaster"
import localFont from "next/font/local"

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
      <body className={`${monument.variable} font-sans flex flex-col min-h-screen`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
