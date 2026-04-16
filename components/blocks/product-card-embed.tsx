'use client'

import React, { useEffect, useState } from 'react'
import { Check, Star, ExternalLink, Activity } from 'lucide-react'

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
      <div className="product-card-embed w-full max-w-3xl my-8 mx-auto p-8 rounded-2xl border border-slate-200 bg-slate-50 animate-pulse flex items-center justify-center">
        <Activity className="h-6 w-6 text-slate-400 animate-spin mr-2" />
        <span className="text-slate-500 font-medium">Loading product details...</span>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="product-card-embed w-full max-w-3xl my-8 mx-auto p-6 rounded-2xl border border-red-100 bg-red-50/50 flex flex-col items-center justify-center text-center">
        <span className="font-bold text-red-600 mb-1">Product Not Found</span>
        <span className="text-sm text-red-500">The product card `{slug}` is missing or unpublished.</span>
      </div>
    )
  }

  const features = data.specs ? Object.entries(data.specs as Record<string, string>) : []

  return (
    <div className="product-card-embed relative w-full max-w-3xl my-10 mx-auto bg-white rounded-2xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] hover:border-slate-300 flex flex-col group">
      
      {data.badge_text && (
        <div className="absolute top-0 right-0 lg:top-4 lg:right-4 z-10">
          <div className="bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest py-1.5 px-4 lg:rounded-full shadow-md rounded-bl-xl shadow-orange-600/20">
            {data.badge_text}
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row p-6 md:p-8 gap-8">
        
        {/* Left Side: Visuals */}
        <div className="flex-shrink-0 w-full md:w-1/3 flex flex-col items-center justify-center relative">
          <div className="relative w-full aspect-square md:aspect-auto md:h-56 bg-slate-50 rounded-xl border border-slate-100 p-4 flex items-center justify-center group-hover:bg-slate-100/50 transition-colors">
            {data.image_url ? (
              <img 
                src={data.image_url} 
                alt={data.title} 
                className="max-h-full max-w-full object-contain mix-blend-multiply drop-shadow-sm transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <span className="text-slate-400 font-medium text-sm">No image</span>
            )}
          </div>
          
          {data.price_text && (
            <div className="mt-6 text-center w-full">
              <p className="text-sm text-slate-500 font-medium uppercase tracking-widest mb-1">Current Price</p>
              <div className="text-3xl font-black text-slate-900 tracking-tight">{data.price_text}</div>
            </div>
          )}
        </div>

        {/* Right Side: Details */}
        <div className="flex-1 flex flex-col">
          <div className="mb-4">
            {data.brand && (
              <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2">{data.brand}</p>
            )}
            <h3 className="text-2xl font-bold text-slate-900 leading-tight mb-3">
              {data.title}
            </h3>
            
            {data.rating_text && (
              <div className="flex items-center gap-1.5 mb-4 bg-orange-50 w-max px-2.5 py-1 rounded-full border border-orange-100">
                <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
                <span className="text-xs font-bold text-orange-700">{data.rating_text}</span>
              </div>
            )}
            
            {data.short_description && (
              <p className="text-slate-600 leading-relaxed text-[15px]">
                {data.short_description}
              </p>
            )}
          </div>

          {features.length > 0 && (
            <div className="mt-4 mb-6 bg-slate-50 rounded-xl p-5 border border-slate-100">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Technical Specs</h4>
              <ul className="grid gap-3">
                {features.map(([key, value]) => (
                  <li key={key} className="flex items-start gap-2.5 text-[13px]">
                    <Check className="w-[14px] h-[14px] text-green-500 mt-0.5 flex-shrink-0" strokeWidth={3} />
                    <div>
                      <span className="font-semibold text-slate-900 mr-1.5">{key}:</span>
                      <span className="text-slate-600">{value}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-auto pt-4">
            <a 
              href={data.external_url || '#'} 
              target="_blank" 
              rel="noopener noreferrer nofollow"
              className="group/btn flex items-center justify-center gap-2 w-full bg-slate-900 hover:bg-black text-white px-6 py-4 rounded-xl font-bold transition-all shadow-[0_4px_14px_0_rgba(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)] active:scale-[0.98]"
            >
              <span>{data.cta_label || 'View Current Price'}</span>
              <ExternalLink className="w-4 h-4 transition-transform group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
