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

      <div className="flex flex-col md:flex-row p-6 md:p-8 gap-8 md:gap-10">
        
        {/* Left Side: Visuals (Primary Focus) */}
        <div className="flex-shrink-0 w-full md:w-[50%] flex flex-col items-center justify-center relative">
          <div className="relative w-full aspect-square md:aspect-auto md:h-80 bg-slate-50 rounded-xl border border-slate-100 p-5 md:p-8 flex items-center justify-center group-hover:bg-slate-100/50 transition-colors">
            {data.image_url ? (
              <img 
                src={data.image_url} 
                alt={data.title} 
                className="max-h-full max-w-full object-contain mix-blend-multiply drop-shadow-sm transition-transform duration-500 group-hover:scale-[1.08]"
              />
            ) : (
              <span className="text-slate-400 font-medium text-sm">No image</span>
            )}
          </div>
          
          <div className="mt-6 w-full">
            {data.price_text && (
              <div className="text-center w-full mb-5">
                <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.24em] mb-1.5">Current Price</p>
                <div className="text-5xl md:text-[3rem] font-black text-slate-900 tracking-tight leading-none drop-shadow-sm">{data.price_text}</div>
              </div>
            )}

            {(() => {
              const url = data.external_url;
              const validUrl = url ? (url.startsWith('http') ? url : `https://${url}`) : '#';

              const getStoreNameFromUrl = (u: string) => {
                if (u === '#') return null;
                try {
                  const hostname = new URL(u).hostname.replace(/^www\./, '').toLowerCase();
                  if (hostname.includes('ebay')) return 'eBay';
                  if (hostname.includes('amazon')) return 'Amazon';
                  if (hostname.includes('deeldepot')) return 'Deeldepot';
                  if (hostname.includes('aliexpress')) return 'AliExpress';
                  if (hostname.includes('bestbuy')) return 'Best Buy';
                  if (hostname.includes('walmart')) return 'Walmart';
                  if (hostname.includes('target')) return 'Target';
                  
                  const domainParts = hostname.split('.');
                  let longest = domainParts[0];
                  for (let part of domainParts) {
                    if (part.length > longest.length && !['com', 'net', 'org', 'co', 'uk'].includes(part)) {
                      longest = part;
                    }
                  }
                  return longest.charAt(0).toUpperCase() + longest.slice(1);
                } catch (e) {
                  return null;
                }
              };
              
              const storeName = getStoreNameFromUrl(validUrl);
              const label = data.cta_label || (storeName ? `View on ${storeName}` : 'View Current Price');

              return (
                <a 
                  href={validUrl} 
                  target="_blank" 
                  rel="noopener noreferrer nofollow"
                  className="group/btn flex items-center justify-center gap-2 w-full bg-orange-600 hover:bg-orange-700 text-white px-6 py-4 rounded-xl text-lg font-bold transition-all shadow-[0_4px_14px_0_rgba(234,88,12,0.28)] hover:shadow-[0_8px_24px_rgba(234,88,12,0.32)] active:scale-[0.98]"
                >
                  <span>{label}</span>
                  <ExternalLink className="w-5 h-5 transition-transform group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />
                </a>
              )
            })()}
          </div>
        </div>

        {/* Right Side: Details (Secondary Focus) */}
        <div className="flex-1 flex flex-col md:pt-4">
          <div className="mb-4">
            {data.brand && (
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.24em] mb-2">{data.brand}</p>
            )}
            <h3 className="text-xl md:text-2xl font-bold text-slate-800 leading-tight mb-3">
              {data.title}
            </h3>
            
            {data.rating_text && (
              <div className="flex items-center gap-1.5 mb-4 bg-orange-50/80 w-max px-2.5 py-1 rounded-full border border-orange-100/50">
                <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
                <span className="text-[11px] font-bold text-orange-700">{data.rating_text}</span>
              </div>
            )}
            
            {data.short_description && (
              <p className="text-slate-500 leading-relaxed text-xs md:text-sm line-clamp-2">
                {data.short_description}
              </p>
            )}
          </div>

          {features.length > 0 && (
            <div className="mt-2 bg-slate-50 rounded-xl p-4 md:p-5 border border-slate-100">
              <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.22em] mb-3 border-b border-slate-200 pb-2">Key Specs</h4>
              <ul className="grid gap-2.5">
                {features.slice(0, 4).map(([key, value]) => (
                  <li key={key} className="flex items-start gap-2.5 text-[13px]">
                    <Check className="w-[14px] h-[14px] text-green-500 mt-0.5 flex-shrink-0" strokeWidth={3} />
                    <div>
                      <span className="font-semibold text-slate-900 mr-1.5">{key}:</span>
                      <span className="text-slate-600">{value}</span>
                    </div>
                  </li>
                ))}
              </ul>

              {features.length > 4 && (
                <p className="mt-3 text-xs font-medium text-slate-500">
                  +{features.length - 4} more specs available
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
