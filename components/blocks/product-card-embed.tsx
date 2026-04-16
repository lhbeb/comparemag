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
    <div className="product-card-embed relative w-full max-w-4xl my-10 mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
      
      {data.badge_text && (
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-orange-600 text-white text-[10px] font-bold uppercase tracking-widest py-1 px-3 rounded-full shadow-sm">
            {data.badge_text}
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row">
        
        {/* Left Side: Product Stage */}
        <div className="w-full md:w-[38%] bg-slate-50/50 p-8 flex items-center justify-center relative border-b md:border-b-0 md:border-r border-slate-100 group-hover:bg-slate-50 transition-colors">
          <div className="relative w-full aspect-square flex items-center justify-center">
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
        </div>

        {/* Right Side: Content & Action Row */}
        <div className="w-full md:w-[62%] flex flex-col p-6 md:p-8 justify-between">
          
          <div className="mb-6">
            {data.brand && (
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">{data.brand}</p>
            )}
            <h3 className="text-2xl md:text-[1.65rem] font-bold text-slate-900 leading-tight mb-3">
              {data.title}
            </h3>
            
            {data.rating_text && (
              <div className="flex items-center gap-1.5 mb-4">
                <Star className="w-[18px] h-[18px] text-orange-400 fill-orange-400" />
                <span className="text-sm font-bold text-slate-700">{data.rating_text}</span>
              </div>
            )}
            
            {data.short_description && (
              <p className="text-slate-600 leading-relaxed text-sm md:text-[15px] mb-5">
                {data.short_description}
              </p>
            )}

            {features.length > 0 && (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6">
                {features.slice(0, 4).map(([key, value]) => (
                  <li key={key} className="flex items-start gap-2 text-[13px]">
                    <Check className="w-[14px] h-[14px] text-green-500 mt-0.5 flex-shrink-0" strokeWidth={3} />
                    <div className="leading-tight">
                      <span className="font-bold text-slate-800 mr-1.5">{key}:</span>
                      <span className="text-slate-600">{value}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Bottom Action Row */}
          <div className="mt-auto pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <div className="w-full sm:w-auto text-left">
              {data.price_text && (
                <>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Current Price</p>
                  <div className="text-3xl font-black text-slate-900 tracking-tight">{data.price_text}</div>
                </>
              )}
            </div>

            <div className="w-full sm:w-auto sm:min-w-[240px]">
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
                    className="group/btn flex items-center justify-center gap-2 w-full bg-orange-600 hover:bg-orange-700 text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-md hover:shadow-orange-600/25 active:scale-[0.98]"
                  >
                    <span>{label}</span>
                    <ExternalLink className="w-[18px] h-[18px] transition-transform group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />
                  </a>
                )
              })()}
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}
