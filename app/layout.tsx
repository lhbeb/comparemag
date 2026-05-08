import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import Script from "next/script"
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
  alternates: {
    types: {
      'application/rss+xml': '/feed.xml',
    },
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
        <meta name="msvalidate.01" content="75494FC1101908256EEEA046C47C3264" />
      </head>
      <body className={`${dmSans.variable} font-sans flex flex-col min-h-screen overflow-x-hidden`}>
        {children}
        <Toaster />
        <SessionTracker />
        <Script id="microsoft-clarity" strategy="lazyOnload">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "wnusij5uc4");
          `}
        </Script>
      </body>
    </html>
  )
}
