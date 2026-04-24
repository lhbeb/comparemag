"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { SupabaseImage } from "@/components/supabase-image"
import { Clock } from "lucide-react"

interface ArticleCardProps {
  title: string
  description: string
  category: string
  readTime: string
  slug: string
  image: string
}

export function LazyArticleCard({ title, description, category, readTime, slug, image }: ArticleCardProps) {
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
      { rootMargin: '50px' }
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={cardRef} className="h-full">
      {isVisible ? (
        <Link href={`/blog/${slug}/`} className="group block h-full">
          <div className="review-card h-full flex flex-col">
            {/* Image */}
            <div className="relative h-52 flex-shrink-0 overflow-hidden">
              {!imageLoaded && (
                <div className="absolute inset-0 skeleton" />
              )}
              <SupabaseImage
                src={image || "/placeholder.svg"}
                alt={`${title} thumbnail`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onLoad={() => setImageLoaded(true)}
              />
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1 p-6 sm:p-8">
              <h3 className="font-bold tracking-tight text-slate-900 text-xl leading-[1.2] mb-2 group-hover:text-blue-700 transition-colors duration-200 line-clamp-2">
                {title}
              </h3>
              <p className="text-slate-500 text-[15px] leading-relaxed line-clamp-3 flex-1">
                {description}
              </p>

              {/* Footer */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-400 uppercase tracking-widest">
                  <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{readTime}</span>
                </div>
                <span className="text-[13px] font-bold text-blue-700 group-hover:text-orange-600 transition-colors duration-200 uppercase tracking-wider">
                  Read more
                </span>
              </div>
            </div>
          </div>
        </Link>
      ) : (
        <div className="review-card h-full flex flex-col">
          <div className="h-52 flex-shrink-0 skeleton rounded-none" />
          <div className="flex flex-col flex-1 p-5 gap-3">
            <div className="skeleton h-3.5 w-20 rounded-full" />
            <div className="skeleton h-5 w-full rounded" />
            <div className="skeleton h-5 w-3/4 rounded" />
            <div className="skeleton h-4 w-full rounded mt-1" />
            <div className="skeleton h-4 w-5/6 rounded" />
            <div className="skeleton h-4 w-2/3 rounded" />
          </div>
        </div>
      )}
    </div>
  )
}
