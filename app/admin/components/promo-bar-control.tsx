'use client'

import { useState } from 'react'
import { Sparkles, Search, CheckCircle, X } from 'lucide-react'
import { setFeaturedArticle } from '@/app/actions/promo'
import { useRouter } from 'next/navigation'

export function PromoBarControl({ articles }: { articles: any[] }) {
  const [search, setSearch] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()

  // Find currently featured article
  const featured = articles.find(a => a.is_featured === true)

  const handleSetFeatured = async (slug: string | null) => {
    setIsUpdating(true)
    try {
      await setFeaturedArticle(slug)
      router.refresh()
      setSearch('') // clear search after updating
    } catch (e: any) {
      alert(e.message)
    } finally {
      setIsUpdating(false)
    }
  }

  // Filter published articles matching query
  const filtered = articles
    .filter(a => a.published && a.title.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 5) // Top 5 results to keep UI small

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-slate-100 bg-[#0D1321] text-white flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-orange-500" />
        <h3 className="font-semibold text-sm">Promo Bar Control</h3>
      </div>
      
      <div className="p-5 flex-1 flex flex-col gap-4">
        {/* Currently Featured */}
        <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 text-sm">
          <div className="font-semibold text-orange-900 mb-1">Currently Featuring:</div>
          {featured ? (
             <div className="flex items-start justify-between gap-2">
               <span className="text-orange-800 line-clamp-2 leading-tight">{featured.title}</span>
               <button 
                 onClick={() => handleSetFeatured(null)}
                 disabled={isUpdating}
                 className="text-orange-600 hover:text-orange-900 font-medium whitespace-nowrap bg-orange-100 px-2 py-0.5 rounded text-xs transition-colors"
               >
                  Unfeature
               </button>
             </div>
          ) : (
            <span className="text-orange-700 italic">None. Top bar shows default message.</span>
          )}
        </div>

        {/* Search & Set UI */}
        <div className="relative mt-2">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search published articles to feature..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Search Results */}
        {search.length > 0 && (
          <div className="bg-slate-50 border border-slate-100 rounded-lg flex flex-col gap-1 p-2 max-h-40 overflow-y-auto">
             {filtered.length === 0 ? (
               <span className="text-slate-400 text-xs text-center py-2">No matching published articles found.</span>
             ) : (
               filtered.map(a => (
                 <button
                   key={a.id}
                   onClick={() => handleSetFeatured(a.slug)}
                   disabled={isUpdating}
                   className="text-left text-xs p-2 rounded-md hover:bg-slate-200 text-slate-700 font-medium truncate transition-colors flex items-center justify-between group"
                 >
                   <span className="truncate pr-2">{a.title}</span>
                   <span className="text-[10px] uppercase text-blue-600 opacity-0 group-hover:opacity-100 font-bold tracking-wider">Select</span>
                 </button>
               ))
             )}
          </div>
        )}
      </div>
    </div>
  )
}
