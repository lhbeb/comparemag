'use client'

import { useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LayoutGrid, List, Search } from 'lucide-react'
import { ArticleTabs } from '@/components/admin/article-tabs'

function formatInternalOwner(value: string) {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function ArticlesFilters({ articles }: { articles: any[] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [editorFilter, setEditorFilter] = useState('all')
  const [listedByFilter, setListedByFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid')

  const availableEditors = useMemo(
    () =>
      Array.from(new Set(articles.map((article) => article.author).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b)
      ),
    [articles]
  )

  const availableInternalOwners = useMemo(
    () =>
      Array.from(new Set(articles.map((article) => article.listed_by).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b)
      ),
    [articles]
  )

  const availableCategories = useMemo(
    () =>
      Array.from(new Set(articles.map((article) => article.category).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b)
      ),
    [articles]
  )

  const filteredArticles = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase()

    return articles.filter((article) => {
      const matchesSearch =
        !normalizedSearch ||
        article.title?.toLowerCase().includes(normalizedSearch) ||
        article.slug?.toLowerCase().includes(normalizedSearch) ||
        article.author?.toLowerCase().includes(normalizedSearch) ||
        article.category?.toLowerCase().includes(normalizedSearch) ||
        article.listed_by?.toLowerCase().includes(normalizedSearch)

      const matchesEditor = editorFilter === 'all' || article.author === editorFilter
      const matchesListedBy = listedByFilter === 'all' || article.listed_by === listedByFilter
      const matchesCategory = categoryFilter === 'all' || article.category === categoryFilter

      return matchesSearch && matchesEditor && matchesListedBy && matchesCategory
    })
  }, [articles, categoryFilter, editorFilter, listedByFilter, searchQuery])

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800">Browse Articles</p>
            <p className="text-xs text-slate-500">Switch between compact rows and visual cards.</p>
          </div>

          <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              aria-pressed={viewMode === 'list'}
            >
              <List className="h-3.5 w-3.5" />
              List
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              aria-pressed={viewMode === 'grid'}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Grid
            </button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,220px))]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles, slugs, editors, categories..."
              className="pl-9 bg-slate-50 border-slate-200"
            />
          </div>

          <Select value={editorFilter} onValueChange={setEditorFilter}>
            <SelectTrigger className="bg-slate-50 border-slate-200">
              <SelectValue placeholder="Filter by editor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All editors</SelectItem>
              {availableEditors.map((editor) => (
                <SelectItem key={editor} value={editor}>
                  {editor}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={listedByFilter} onValueChange={setListedByFilter}>
            <SelectTrigger className="bg-slate-50 border-slate-200">
              <SelectValue placeholder="Filter by listed by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All listed by</SelectItem>
              {availableInternalOwners.map((owner) => (
                <SelectItem key={owner} value={owner}>
                  {formatInternalOwner(owner)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="bg-slate-50 border-slate-200">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {availableCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <ArticleTabs articles={filteredArticles} viewMode={viewMode} />
    </div>
  )
}
