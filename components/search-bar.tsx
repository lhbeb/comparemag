"use client"

import { useState, useEffect, useRef, KeyboardEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Search, X, Clock, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface SearchResult {
  slug: string
  title: string
  description: string
  category: string
  date: string
  image: string
}

export function SearchBar() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setIsOpen(false)
      return
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/articles/search?q=${encodeURIComponent(query)}`)
        if (response.ok) {
          const data = await response.json()
          setResults(data.articles || [])
          setIsOpen(true)
          setSelectedIndex(-1)
        }
      } catch (error) {
        console.error("Search error:", error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }, 300) // 300ms debounce

    return () => clearTimeout(timeoutId)
  }, [query])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) {
      if (e.key === "Enter" && query.trim()) {
        router.push(`/articles/?search=${encodeURIComponent(query)}`)
        setIsOpen(false)
      }
      return
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          router.push(`/blog/${results[selectedIndex].slug}/`)
          setIsOpen(false)
          setQuery("")
        } else if (query.trim()) {
          router.push(`/articles/?search=${encodeURIComponent(query)}`)
          setIsOpen(false)
        }
        break
      case "Escape":
        setIsOpen(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  const handleResultClick = (slug: string) => {
    router.push(`/blog/${slug}/`)
    setIsOpen(false)
    setQuery("")
    inputRef.current?.blur()
  }

  const clearSearch = () => {
    setQuery("")
    setResults([])
    setIsOpen(false)
    inputRef.current?.focus()
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search articles..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className={cn(
            "w-full h-11 pl-11 pr-10 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-gray-400",
            "focus:bg-white/15 focus:border-accent/50 focus:ring-2 focus:ring-accent/30",
            "transition-all duration-300 rounded-full shadow-lg hover:bg-white/15",
            "font-medium"
          )}
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (query.trim() || results.length > 0) && (
        <div className="absolute top-full mt-3 w-full bg-[#0b102d]/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-400">
              <div className="animate-pulse">Searching...</div>
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="p-2 text-xs text-gray-400 border-b border-white/10 px-4 py-3 bg-white/5">
                {results.length} {results.length === 1 ? "result" : "results"} found
              </div>
              {results.map((result, index) => (
                <button
                  key={result.slug}
                  onClick={() => handleResultClick(result.slug)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    "w-full text-left p-4 hover:bg-white/10 transition-all duration-200 border-b border-white/5 last:border-b-0",
                    "focus:outline-none focus:bg-white/10",
                    selectedIndex === index && "bg-white/10"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-accent-400 bg-accent/10 px-2 py-0.5 rounded-full">{result.category}</span>
                        <span className="text-xs text-gray-500">•</span>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="h-3 w-3" />
                          {result.date}
                        </div>
                      </div>
                      <h3 className="font-semibold text-white mb-1 line-clamp-1">{result.title}</h3>
                      <p className="text-sm text-gray-400 line-clamp-2">{result.description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-500 flex-shrink-0 mt-1" />
                  </div>
                </button>
              ))}
              {query.trim() && (
                <div className="p-3 border-t border-white/10 bg-white/5">
                  <Link
                    href={`/articles/?search=${encodeURIComponent(query)}`}
                    className="flex items-center justify-center gap-2 text-sm text-accent-400 hover:text-accent-300 transition-colors font-semibold"
                  >
                    View all results for "{query}"
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </>
          ) : query.trim() && !isLoading ? (
            <div className="p-6 text-center">
              <p className="text-gray-400 mb-2">No articles found</p>
              <p className="text-sm text-gray-500">Try a different search term</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

