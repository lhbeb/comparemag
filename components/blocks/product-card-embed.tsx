'use client'

import React, { useEffect, useState } from 'react'
import { Check, Star, ExternalLink, ShoppingCart, Tag } from 'lucide-react'

export interface ProductCardData {
  id?: string
  slug: string
  title: string
  brand?: string | null
  image_url?: string | null
  short_description?: string | null
  cta_label?: string | null
  external_url?: string | null
  price_text?: string | null
  rating_text?: string | null
  badge_text?: string | null
  specs?: any | null
}

interface ProductCardEmbedProps {
  slug: string
  preloadedData?: ProductCardData | null
}

export function ProductCardEmbed({ slug, preloadedData }: ProductCardEmbedProps) {
  const [data, setData] = useState<ProductCardData | null>(preloadedData || null)
  const [loading, setLoading] = useState(!preloadedData)
  const [error, setError] = useState(false)

  // Fallback data loading for client-side Admin previews
  useEffect(() => {
    if (preloadedData) {
      setData(preloadedData)
      setLoading(false)
      setError(false)
      return
    }

    let isMounted = true
    async function loadData() {
      try {
        const res = await fetch(`/api/products/${slug}`)
        if (!res.ok) throw new Error('Not found')
        const json = await res.json()
        if (isMounted) {
          setData(json)
          setLoading(false)
        }
      } catch (e) {
        if (isMounted) {
          setError(true)
          setLoading(false)
        }
      }
    }
    loadData()
    return () => { isMounted = false }
  }, [slug, preloadedData])

  if (loading) {
    return (
      <div className="product-card-embed not-prose w-full max-w-2xl my-10 mx-auto rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden animate-pulse">
        <div className="h-64 bg-slate-200" />
        <div className="p-6 space-y-3">
          <div className="h-4 bg-slate-200 rounded w-1/4" />
          <div className="h-6 bg-slate-200 rounded w-3/4" />
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-5/6" />
          <div className="h-12 bg-slate-200 rounded-xl mt-4" />
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="product-card-embed not-prose w-full max-w-2xl my-10 mx-auto p-6 rounded-2xl border border-red-100 bg-red-50/50 flex flex-col items-center justify-center text-center">
        <span className="font-bold text-red-600 mb-1">Product Not Found</span>
        <span className="text-sm text-red-500">The product card `{slug}` is missing or unpublished.</span>
      </div>
    )
  }

  const specsData = data.specs || {}
  const condition = (specsData as Record<string, string>).condition || null
  const features = Object.entries(specsData as Record<string, string>).filter(([key]) => key !== 'condition')

  // Build the CTA URL
  const rawUrl = data.external_url
  const validUrl = rawUrl ? (rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`) : '#'

  const getStoreNameFromUrl = (u: string) => {
    if (u === '#') return null
    try {
      const hostname = new URL(u).hostname.replace(/^www\./, '').toLowerCase()
      if (hostname.includes('ebay')) return 'eBay'
      if (hostname.includes('amazon')) return 'Amazon'
      if (hostname.includes('deeldepot')) return 'Deeldepot'
      if (hostname.includes('aliexpress')) return 'AliExpress'
      if (hostname.includes('bestbuy')) return 'Best Buy'
      if (hostname.includes('walmart')) return 'Walmart'
      if (hostname.includes('target')) return 'Target'
      const domainParts = hostname.split('.')
      let longest = domainParts[0]
      for (const part of domainParts) {
        if (part.length > longest.length && !['com', 'net', 'org', 'co', 'uk'].includes(part)) {
          longest = part
        }
      }
      return longest.charAt(0).toUpperCase() + longest.slice(1)
    } catch {
      return null
    }
  }

  const storeName = getStoreNameFromUrl(validUrl)
  const ctaLabel = data.cta_label || (storeName ? `Check Price on ${storeName}` : 'Check Price')
  const shortNote = data.short_description
    ? data.short_description.length > 70
      ? `${data.short_description.slice(0, 70).trimEnd()}…`
      : data.short_description
    : null

  return (
    <div className="product-card-embed not-prose w-full max-w-2xl my-10 mx-auto bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group">

      {/* ── Image Panel ── full-bleed, no padding, object-cover */}
      <div className="relative w-full h-64 sm:h-72 overflow-hidden bg-slate-100">
        {data.image_url ? (
          <img
            src={data.image_url}
            alt={data.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          /* Elegant no-image placeholder */
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
            <ShoppingCart className="w-12 h-12 text-slate-300 mb-2" />
            <span className="text-slate-400 text-sm font-medium">No image available</span>
          </div>
        )}

        {/* Badge overlay */}
        {data.badge_text && (
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-orange-600 text-white text-[10px] font-bold uppercase tracking-widest py-1 px-3 rounded-full shadow">
              {data.badge_text}
            </span>
          </div>
        )}

        {/* Gradient fade at bottom so text reads cleanly */}
        <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
      </div>

      {/* ── Content Panel ── */}
      <div className="p-6 md:p-7 flex flex-col gap-4">

        {/* Brand + Title */}
        <div>
          {data.brand && (
            <p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-1.5">{data.brand}</p>
          )}
          <h3 className="text-xl md:text-2xl font-bold text-slate-900 leading-snug">
            {data.title}
          </h3>

          {data.rating_text && (
            <div className="flex items-center gap-1.5 mt-2">
              <div className="flex">
                {(() => {
                  const ratingVal = parseFloat(data.rating_text)
                  const starCount = !isNaN(ratingVal) ? Math.min(5, Math.max(1, Math.round(ratingVal))) : 1
                  return Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < starCount ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />
                  ))
                })()}
              </div>
              <span className="text-sm font-semibold text-slate-700 ml-1">{data.rating_text}</span>
            </div>
          )}
        </div>

        {/* Condition Badge */}
        {condition && (
          <div className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 font-medium text-xs px-2.5 py-1 rounded-md self-start border border-slate-200">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <span>Condition: <span className="font-bold text-slate-900">{condition}</span></span>
          </div>
        )}

        {/* Subtle note */}
        {shortNote && (
          <div className="my-1 border-l-2 border-slate-200 pl-3">
            <p className="text-sm text-slate-500 italic leading-relaxed">
              {shortNote}
            </p>
          </div>
        )}

        {/* Specs grid */}
        {features.length > 0 && (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6">
            {features.slice(0, 6).map(([key, value]) => (
              <li key={key} className="flex items-start gap-2 text-[13px]">
                <Check className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" strokeWidth={3} />
                <div className="leading-tight">
                  <span className="font-bold text-slate-800 mr-1">{key}:</span>
                  <span className="text-slate-600">{value}</span>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* ── Price + CTA Row ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 mt-auto">

          {data.price_text ? (
            <div className="w-full sm:w-auto text-left">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Current Price</p>
              <div className="text-3xl font-black text-slate-900 tracking-tight">{data.price_text}</div>
            </div>
          ) : (
            <div className="hidden sm:block" />
          )}

          <a
            href={validUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="group/btn flex items-center justify-center gap-2 w-full sm:w-auto sm:min-w-[220px] bg-orange-600 hover:bg-orange-700 active:scale-[0.98] text-white visited:text-white hover:text-white visited:hover:text-white no-underline font-bold px-6 py-3.5 rounded-xl transition-all shadow-md hover:shadow-orange-500/30"
          >
            <span>{ctaLabel}</span>
            <ExternalLink className="w-4 h-4 transition-transform group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />
          </a>
        </div>

      </div>
    </div>
  )
}
