"use client"

import dynamic from 'next/dynamic'

// Lazy load the SearchBar component
export const LazySearchBar = dynamic(() => import('./search-bar').then(mod => ({ default: mod.SearchBar })), {
  ssr: false,
  loading: () => (
    <div className="w-[220px] lg:w-[260px] h-11 bg-white/5 border border-white/10 rounded-full animate-pulse shadow-sm" />
  ),
})

