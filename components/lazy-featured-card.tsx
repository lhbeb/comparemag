"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { SupabaseImage } from "@/components/supabase-image"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Star } from "lucide-react"

interface FeaturedCardProps {
  title: string
  description: string
  image: string
  readTime: string
  category: string
  icon: React.ReactNode
  slug: string
}

export function LazyFeaturedCard({ title, description, image, readTime, category, icon, slug }: FeaturedCardProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observer.disconnect()
          }
        })
      },
      { rootMargin: '100px' }
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={cardRef} className="h-full">
      {isVisible ? (
        <Link href={`/blog/${slug}/`} className="block h-full group">
          <div className="review-card h-full flex flex-col">
            {/* Image */}
            <div className="relative h-44 sm:h-48 flex-shrink-0 overflow-hidden">
              {!imageLoaded && (
                <div className="absolute inset-0 skeleton" />
              )}
              <SupabaseImage
                src={image || "/placeholder.svg"}
                alt={title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
                onLoad={() => setImageLoaded(true)}
              />
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1 p-6 sm:p-8">
              <h3 className="font-bold tracking-tight text-slate-900 text-xl leading-[1.2] mb-2 group-hover:text-blue-700 transition-colors duration-200 line-clamp-2">
                {title}
              </h3>
              <p className="text-slate-500 text-[15px] leading-relaxed line-clamp-2 flex-1">
                {description}
              </p>

              {/* Footer */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-400 uppercase tracking-widest">
                  <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{readTime}</span>
                </div>
                <span className="text-[13px] font-bold text-blue-700 group-hover:text-orange-600 transition-colors duration-200 uppercase tracking-wider">
                  Read review
                </span>
              </div>
            </div>
          </div>
        </Link>
      ) : (
        <div className="review-card h-full flex flex-col">
          <div className="relative h-44 sm:h-48 flex-shrink-0 skeleton rounded-none" />
          <div className="flex flex-col flex-1 p-4 sm:p-5 gap-3">
            <div className="skeleton h-4 w-20 rounded-full" />
            <div className="skeleton h-5 w-full rounded" />
            <div className="skeleton h-5 w-3/4 rounded" />
            <div className="skeleton h-4 w-full rounded mt-1" />
            <div className="skeleton h-4 w-5/6 rounded" />
          </div>
        </div>
      )}
    </div>
  )
}
