"use client"

import dynamic from 'next/dynamic'

// Lazy load the SearchBar component
export const LazySearchBar = dynamic(() => import('./search-bar').then(mod => ({ default: mod.SearchBar })), {
  ssr: false,
  loading: () => (
    <div className="relative w-full max-w-md">
      <div className="w-full h-10 bg-gray-900 border border-gray-700 rounded-lg animate-pulse" />
    </div>
  ),
})

