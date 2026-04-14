"use client"

import { useState, useEffect, useRef, KeyboardEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Search, X, Clock, ArrowRight, BrainCircuit } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { SupabaseImage } from "@/components/supabase-image"
import { format } from "date-fns"

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
  const [isFocused, setIsFocused] = useState(false)
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
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSelectedIndex(-1)
        setIsFocused(false)
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
          inputRef.current?.blur()
        } else if (query.trim()) {
          router.push(`/articles/?search=${encodeURIComponent(query)}`)
          setIsOpen(false)
          inputRef.current?.blur()
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
    <div ref={searchRef} className={cn(
      "relative w-full transition-all duration-300 ease-in-out z-50",
      isFocused ? "w-full min-w-[320px] lg:w-[380px]" : "w-[220px] lg:w-[260px]"
    )}>
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-white transition-colors" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search reviews, deals, topics..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setIsFocused(true)
            if (query.trim()) setIsOpen(true)
          }}
          onBlur={() => {
            // Delay blur to allow clicks inside to fire
            setTimeout(() => {
              if (document.activeElement !== inputRef.current && !isOpen) {
                setIsFocused(false)
              }
            }, 200)
          }}
          onKeyDown={handleKeyDown}
          className={cn(
            "w-full h-11 pl-10 pr-10 bg-white/5 backdrop-blur-md border border-white/10 text-white placeholder:text-slate-400 placeholder:font-medium",
            "focus:bg-white/10 focus:border-white/30 focus:shadow-[0_0_0_2px_rgba(255,255,255,0.1)]",
            "transition-all duration-300 rounded-full hover:bg-white/10",
            "font-medium text-sm"
          )}
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown Popover */}
      {isOpen && (query.trim() || results.length > 0) && (
        <div className="absolute top-[calc(100%+0.75rem)] right-0 w-[100vw] sm:w-[450px] max-w-[calc(100vw-2rem)] bg-white border border-slate-200 rounded-2xl shadow-2xl z-[100] overflow-hidden transform origin-top-right transition-all animate-in fade-in zoom-in-95 duration-200">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-accent mb-3"></div>
              <p className="text-slate-500 font-medium text-sm">Searching our database...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="max-h-[75vh] overflow-y-auto overflow-x-hidden">
              <div className="sticky top-0 bg-slate-50/95 backdrop-blur-sm p-3 px-4 text-xs font-bold text-slate-500 border-b border-slate-100 z-10 flex justify-between items-center uppercase tracking-wider">
                <span>Top Results</span>
                <span className="text-accent">{results.length} found</span>
              </div>
              <div className="p-2 space-y-1">
                {results.map((result, index) => {
                   let formattedDate = result.date
                   try {
                     formattedDate = format(new Date(result.date), 'MMM d, yyyy')
                   } catch (e) {
                     // Fallback
                   }

                   return (
                    <button
                      key={result.slug}
                      onClick={() => handleResultClick(result.slug)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        "w-full text-left p-2.5 hover:bg-slate-50 rounded-xl transition-all duration-200 group flex gap-4 items-center relative overflow-hidden",
                        "focus:outline-none focus:ring-2 focus:ring-accent/40 focus:bg-slate-50",
                        selectedIndex === index && "bg-slate-50 ring-1 ring-slate-100"
                      )}
                    >
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200 shadow-sm">
                        <SupabaseImage
                          src={result.image || "/placeholder.svg"}
                          alt=""
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="flex-1 min-w-0 py-0.5">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest flex items-center gap-1">
                            <BrainCircuit className="h-3 w-3" />
                            {result.category}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm leading-snug mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">{result.title}</h3>
                        <p className="text-xs text-slate-500 font-medium tracking-tight truncate pr-4">{formattedDate} • {result.description}</p>
                      </div>
                      <ArrowRight className="absolute right-4 h-4 w-4 text-slate-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    </button>
                  )
                })}
              </div>
              
              {query.trim() && (
                <div className="p-3 border-t border-slate-100 bg-slate-50 sticky bottom-0 z-10">
                  <Link
                    href={`/articles/?search=${encodeURIComponent(query)}`}
                    className="flex justify-center items-center w-full py-2.5 px-4 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-sm text-slate-700 hover:text-slate-900 font-bold transition-all shadow-sm group"
                  >
                    View all results for "{query}" 
                    <ArrowRight className="h-4 w-4 ml-2 text-slate-400 group-hover:text-slate-600 transition-colors group-hover:translate-x-1" />
                  </Link>
                </div>
              )}
            </div>
          ) : query.trim() && !isLoading ? (
            <div className="p-12 text-center">
              <Search className="h-10 w-10 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-900 font-bold mb-1">No matches found</p>
              <p className="text-sm text-slate-500">We couldn't find anything for "{query}". Try checking your spelling or searching for a category.</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
