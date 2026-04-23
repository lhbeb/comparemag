'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'

export function PromoBarCarousel({ features }: { features: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (features.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((current) => (current + 1) % features.length)
    }, 2800) // Stays for 2 seconds + crossfade time

    return () => clearInterval(interval)
  }, [features.length])

  if (features.length === 0) {
    return (
      <Link href="/articles/" className="inline-flex items-center gap-2 group transition-colors" aria-label="Browse featured articles">
        <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 text-orange-500 group-hover:translate-x-0.5 transition-transform" />
        <span className="text-white text-xs sm:text-sm font-bold leading-tight sm:leading-none group-hover:underline decoration-white/50 underline-offset-4">
          Tomorrow belongs to those who embrace it today
        </span>
      </Link>
    )
  }

  return (
    <div className="relative h-6 sm:h-5 flex items-center justify-center w-full max-w-4xl mx-auto overflow-visible px-4">
      {features.map((item, index) => (
        <Link 
          key={item.id}
          href={`/blog/${item.slug}`} 
          className={`absolute inline-flex items-center gap-2 group transition-all duration-700 ease-in-out
            ${index === currentIndex 
              ? 'opacity-100 translate-y-0 scale-100 z-10' 
              : 'opacity-0 translate-y-2 scale-95 pointer-events-none -z-10'
            }
          `}
        >
          <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 text-orange-500 group-hover:scale-110 transition-transform" />
          <span className="text-white text-xs sm:text-sm font-bold leading-tight sm:leading-none text-center truncate max-w-[280px] sm:max-w-md md:max-w-xl group-hover:underline decoration-white/50 underline-offset-4 pointer-events-auto cursor-pointer">
            Featured: {item.title}
          </span>
          <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 text-orange-500 group-hover:translate-x-0.5 transition-transform ml-1" />
        </Link>
      ))}
    </div>
  )
}
