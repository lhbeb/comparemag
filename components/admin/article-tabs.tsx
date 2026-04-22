'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Edit, Eye, EyeOff, FilePen, FileText, UserCog, Wand2, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { SupabaseImage } from '@/components/supabase-image'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from '@/hooks/use-toast'

interface ArticleTabsProps {
  articles: any[] // Using any here to bypass exact match, since Supabase Row types differ slightly
  viewMode: 'list' | 'grid'
}

const ARTICLES_PER_PAGE = 10

function formatInternalOwner(value: string) {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function getCategoryBadgeClass(category: string) {
  switch ((category || '').toLowerCase()) {
    case 'smartphones':
      return 'bg-sky-50 text-sky-700 border-sky-200'
    case 'laptops & pcs':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200'
    case 'audio & headphones':
      return 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200'
    case 'home appliances':
      return 'bg-cyan-50 text-cyan-700 border-cyan-200'
    case 'gaming':
      return 'bg-violet-50 text-violet-700 border-violet-200'
    case 'cameras':
      return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'wearables':
      return 'bg-rose-50 text-rose-700 border-rose-200'
    case 'tvs & displays':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'price comparison':
      return 'bg-orange-50 text-orange-700 border-orange-200'
    case 'buying guide':
      return 'bg-teal-50 text-teal-700 border-teal-200'
    case 'news':
      return 'bg-slate-100 text-slate-700 border-slate-200'
    case 'deals':
      return 'bg-red-50 text-red-700 border-red-200'
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200'
  }
}

function getArticleStatus(article: any) {
  if (article.published) {
    return {
      label: 'Published',
      icon: Eye,
      className: 'text-emerald-700',
      dotClassName: 'bg-emerald-500',
    }
  }

  if (article.article_type === 'programmatic') {
    return {
      label: 'Generated',
      icon: Wand2,
      className: 'text-violet-700',
      dotClassName: 'bg-violet-500',
    }
  }

  return {
    label: 'Draft',
    icon: EyeOff,
    className: 'text-slate-500',
    dotClassName: 'bg-slate-400',
  }
}

export function ArticleTabs({ articles, viewMode }: ArticleTabsProps) {
  const [hasMounted, setHasMounted] = React.useState(false)
  const [localArticles, setLocalArticles] = React.useState(articles)
  const [activeTab, setActiveTab] = React.useState<'all' | 'published' | 'drafts' | 'generated'>('all')
  const [currentPage, setCurrentPage] = React.useState(1)

  React.useEffect(() => {
    setHasMounted(true)
  }, [])

  React.useEffect(() => {
    setLocalArticles(articles)
  }, [articles])

  const published = localArticles.filter(a => a.published)
  const manualDrafts = localArticles.filter(a => !a.published && a.article_type !== 'programmatic')
  const generated = localArticles.filter(a => a.article_type === 'programmatic')

  const activeArticles = React.useMemo(() => {
    switch (activeTab) {
      case 'published':
        return published
      case 'drafts':
        return manualDrafts
      case 'generated':
        return generated
      default:
        return localArticles
    }
  }, [activeTab, generated, localArticles, manualDrafts, published])

  const totalPages = Math.max(1, Math.ceil(activeArticles.length / ARTICLES_PER_PAGE))

  const handleDeleted = React.useCallback((slug: string) => {
    setLocalArticles((current) => current.filter((article) => article.slug !== slug))
  }, [])

  React.useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, viewMode, articles])

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  if (!hasMounted) {
    return (
      <div className="space-y-4">
        <div className="h-11 w-[420px] max-w-full rounded-lg bg-slate-100 animate-pulse" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="hidden sm:block h-14 w-14 rounded-md bg-slate-100 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-2/3 rounded bg-slate-100 animate-pulse" />
                    <div className="h-4 w-1/2 rounded bg-slate-100 animate-pulse" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-16 rounded-md bg-slate-100 animate-pulse" />
                  <div className="h-8 w-16 rounded-md bg-slate-100 animate-pulse" />
                  <div className="h-8 w-20 rounded-md bg-slate-100 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderTabContent = (tabArticles: any[]) => (
    <PaginatedArticleCollection
      articles={tabArticles}
      onDeleted={handleDeleted}
      viewMode={viewMode}
      currentPage={currentPage}
      onPageChange={setCurrentPage}
    />
  )

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => setActiveTab(value as 'all' | 'published' | 'drafts' | 'generated')}
      className="w-full"
    >
      <div className="flex items-center justify-between mb-4">
        <TabsList className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg">
          <TabsTrigger value="all" className="px-4 py-1.5 text-sm font-semibold text-slate-600 rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm transition-all">
            All ({localArticles.length})
          </TabsTrigger>
          <TabsTrigger value="published" className="px-4 py-1.5 text-sm font-semibold text-slate-600 rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm transition-all">
            Published ({published.length})
          </TabsTrigger>
          <TabsTrigger value="drafts" className="px-4 py-1.5 text-sm font-semibold text-slate-600 rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm transition-all">
            Manual Drafts ({manualDrafts.length})
          </TabsTrigger>
          <TabsTrigger value="generated" className="px-4 py-1.5 text-sm font-semibold text-slate-600 rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm transition-all">
            Generated ({generated.length})
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="all" className="mt-0">
        {renderTabContent(localArticles)}
      </TabsContent>
      <TabsContent value="published" className="mt-0">
        {renderTabContent(published)}
      </TabsContent>
      <TabsContent value="drafts" className="mt-0">
        {renderTabContent(manualDrafts)}
      </TabsContent>
      <TabsContent value="generated" className="mt-0">
        {renderTabContent(generated)}
      </TabsContent>
    </Tabs>
  )
}

function EmptyArticlesState() {
  return (
    <div className="text-center py-20 rounded-2xl flex flex-col items-center gap-4 bg-white border border-dashed border-slate-200">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-blue-50">
        <FileText className="h-7 w-7 text-blue-600" />
      </div>
      <div>
        <p className="font-semibold mb-1 text-slate-900">No articles found</p>
        <p className="text-sm text-slate-500">There are no articles in this category.</p>
      </div>
    </div>
  )
}

function ArticleCollection({
  articles,
  onDeleted,
  viewMode,
}: {
  articles: any[]
  onDeleted: (slug: string) => void
  viewMode: 'list' | 'grid'
}) {
  if (articles.length === 0) {
    return <EmptyArticlesState />
  }

  if (viewMode === 'grid') {
    return <ArticleGrid articles={articles} onDeleted={onDeleted} />
  }

  return <ArticleList articles={articles} onDeleted={onDeleted} />
}

function PaginatedArticleCollection({
  articles,
  onDeleted,
  viewMode,
  currentPage,
  onPageChange,
}: {
  articles: any[]
  onDeleted: (slug: string) => void
  viewMode: 'list' | 'grid'
  currentPage: number
  onPageChange: (page: number) => void
}) {
  if (articles.length === 0) {
    return <EmptyArticlesState />
  }

  const totalPages = Math.max(1, Math.ceil(articles.length / ARTICLES_PER_PAGE))
  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * ARTICLES_PER_PAGE
  const paginatedArticles = articles.slice(startIndex, startIndex + ARTICLES_PER_PAGE)
  const startCount = startIndex + 1
  const endCount = startIndex + paginatedArticles.length

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <p className="text-sm text-slate-500">
          Showing <span className="font-semibold text-slate-800">{startCount}-{endCount}</span> of{' '}
          <span className="font-semibold text-slate-800">{articles.length}</span> articles
        </p>
      </div>

      <ArticleCollection articles={paginatedArticles} onDeleted={onDeleted} viewMode={viewMode} />

      {totalPages > 1 && (
        <div className="flex justify-end pt-1">
          <PaginationControls currentPage={safePage} totalPages={totalPages} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  )
}

function ArticleList({ articles, onDeleted }: { articles: any[], onDeleted: (slug: string) => void }) {
  return (
    <div className="space-y-3">
      {articles.map((article) => (
        <div key={article.id} className="admin-card relative px-4 py-4 lg:px-5">
          {(() => {
            const status = getArticleStatus(article)
            const StatusIcon = status.icon
            const categoryBadgeClass = getCategoryBadgeClass(article.category)

            return (
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-4 flex-1 min-w-0">
              
                  {/* Thumbnail */}
                  <div className="relative hidden h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-sm sm:block">
                    <SupabaseImage 
                      src={article.image_url || "/placeholder.svg"} 
                      alt="Thumbnail" 
                      fill 
                      className="object-cover" 
                    />
                  </div>

                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-start gap-2.5">
                      <span className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${status.dotClassName}`} />
                  
                      <h2 className="line-clamp-2 text-base font-semibold leading-tight text-slate-900">
                        {article.title}
                      </h2>
                    </div>
                
                    <div className="space-y-1 text-xs text-slate-500">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className={`rounded-md border px-2 py-0.5 font-medium ${categoryBadgeClass}`}>
                          {article.category}
                        </span>
                        <span>{format(new Date(article.created_at), 'MMM d, yyyy')}</span>
                      </div>

                      <div className="inline-flex items-center gap-1.5">
                        <FilePen className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                        <span>{article.author}</span>
                      </div>

                      {article.listed_by && (
                        <div className="inline-flex items-center gap-1.5">
                          <UserCog className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                          <span>{formatInternalOwner(article.listed_by)}</span>
                        </div>
                      )}
                    </div>

                    <div className="truncate text-[11px] font-mono text-slate-400">
                      {article.slug}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 lg:min-w-[220px] lg:justify-end">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild className="h-8 px-3 text-xs font-medium border-slate-200 bg-white text-slate-700">
                      <Link href={`/admin/articles/edit/${article.slug}`}>
                        <Edit className="h-3.5 w-3.5 mr-1.5" />
                        Edit
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="h-8 px-3 text-xs font-medium border-slate-200 bg-white text-slate-700">
                      <Link href={`/blog/${article.slug}`} target="_blank">
                        <Eye className="h-3.5 w-3.5 mr-1.5" />
                        View
                      </Link>
                    </Button>
                    <DeleteArticleButton slug={article.slug} title={article.title} onDeleted={onDeleted} />
                  </div>
                </div>

                <span className={`absolute bottom-4 right-4 inline-flex items-center gap-1 text-[11px] font-medium ${status.className}`}>
                  <StatusIcon className="h-3 w-3" />
                  {status.label}
                </span>
              </div>
            )
          })()}
        </div>
      ))}
    </div>
  )
}

function ArticleGrid({ articles, onDeleted }: { articles: any[], onDeleted: (slug: string) => void }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {articles.map((article) => {
        const status = getArticleStatus(article)
        const StatusIcon = status.icon
        const categoryBadgeClass = getCategoryBadgeClass(article.category)

        return (
          <div
            key={article.id}
            className="admin-card relative flex h-full flex-col overflow-hidden px-0 py-0"
          >
            <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-slate-100 bg-slate-100">
              <SupabaseImage
                src={article.image_url || '/placeholder.svg'}
                alt={article.title || 'Article thumbnail'}
                fill
                className="object-cover"
              />
            </div>

            <div className="flex flex-1 flex-col gap-4 p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <span className={`inline-flex w-fit items-center rounded-md border px-2 py-1 text-[11px] font-semibold leading-none ${categoryBadgeClass}`}>
                    {article.category}
                  </span>

                  <span className={`inline-flex items-center gap-1 self-center text-[11px] font-medium leading-none ${status.className}`}>
                    <StatusIcon className="h-3 w-3" />
                    {status.label}
                  </span>
                </div>

                <h2 className="line-clamp-3 text-base font-semibold leading-snug text-slate-900">
                  {article.title}
                </h2>

                <div className="flex flex-col gap-1.5 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <FilePen className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                    <span>{article.author}</span>
                  </div>
                  {article.listed_by && (
                    <div className="flex items-center gap-1.5">
                      <UserCog className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                      <span>{formatInternalOwner(article.listed_by)}</span>
                    </div>
                  )}
                  <p>{format(new Date(article.created_at), 'MMM d, yyyy')}</p>
                </div>

                <div className="truncate text-[11px] font-mono text-slate-400">
                  {article.slug}
                </div>
              </div>

              <div className="mt-auto flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="h-8 w-8 border-slate-200 bg-white p-0 text-slate-700"
                >
                  <Link href={`/admin/articles/edit/${article.slug}`} aria-label={`Edit ${article.title}`} title="Edit">
                    <Edit className="h-3.5 w-3.5" />
                    <span className="sr-only">Edit</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="h-8 w-8 border-slate-200 bg-white p-0 text-slate-700"
                >
                  <Link
                    href={`/blog/${article.slug}`}
                    target="_blank"
                    aria-label={`View ${article.title}`}
                    title="View"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span className="sr-only">View</span>
                  </Link>
                </Button>
                <DeleteArticleButton slug={article.slug} title={article.title} onDeleted={onDeleted} iconOnly />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  const visiblePages = Array.from({ length: totalPages }, (_, index) => index + 1).filter((page) => {
    return (
      page === 1 ||
      page === totalPages ||
      Math.abs(page - currentPage) <= 1
    )
  })

  const pagesWithBreaks = visiblePages.reduce<Array<number | 'ellipsis'>>((acc, page, index) => {
    if (index > 0 && page - visiblePages[index - 1] > 1) {
      acc.push('ellipsis')
    }
    acc.push(page)
    return acc
  }, [])

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 border-slate-200 bg-white px-3 text-xs text-slate-700"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="mr-1 h-3.5 w-3.5" />
        Prev
      </Button>

      <div className="flex items-center gap-1">
        {pagesWithBreaks.map((item, index) => {
          if (item === 'ellipsis') {
            return (
              <span key={`ellipsis-${index}`} className="px-1 text-xs text-slate-400">
                ...
              </span>
            )
          }

          const isActive = item === currentPage

          return (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              className={`h-8 min-w-8 rounded-md px-2 text-xs font-semibold transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'border border-slate-200 bg-white text-slate-600 hover:text-slate-900'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {item}
            </button>
          )
        })}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 border-slate-200 bg-white px-3 text-xs text-slate-700"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
        <ChevronRight className="ml-1 h-3.5 w-3.5" />
      </Button>
    </div>
  )
}

function DeleteArticleButton({
  slug,
  title,
  onDeleted,
  iconOnly = false,
}: {
  slug: string
  title: string
  onDeleted: (slug: string) => void
  iconOnly?: boolean
}) {
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isPendingRefresh, startRefreshTransition] = React.useTransition()
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/articles/${slug}`, { method: 'DELETE' })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.message || 'Failed to delete article')
      }

      onDeleted(slug)
      setIsDialogOpen(false)
      toast({
        title: 'Article deleted',
        description: `"${title}" was removed successfully.`,
      })

      startRefreshTransition(() => {
        router.refresh()
      })
    } catch (e) {
      toast({
        title: 'Delete failed',
        description: e instanceof Error ? e.message : 'Unable to delete article right now.',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsDialogOpen(true)}
        disabled={isDeleting || isPendingRefresh}
        className={
          iconOnly
            ? 'h-8 w-8 border-slate-200 p-0 text-red-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700'
            : 'h-8 px-3 text-xs font-medium border-slate-200 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200'
        }
        aria-label={`Delete ${title}`}
        title="Delete"
      >
        <Trash2 className={`h-3.5 w-3.5 ${iconOnly ? '' : 'mr-1.5'}`} />
        {iconOnly ? <span className="sr-only">{isDeleting ? 'Deleting...' : 'Delete'}</span> : (isDeleting ? 'Deleting...' : 'Delete')}
      </Button>

      <AlertDialogContent className="max-w-md rounded-2xl border-slate-200 p-0 overflow-hidden">
        <AlertDialogHeader className="px-6 pt-6 text-left">
          <AlertDialogTitle className="text-xl font-bold text-slate-900">
            Delete article?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-slate-600 leading-relaxed">
            <span className="block mb-2">
              This will permanently remove <strong className="text-slate-900">“{title}”</strong>.
            </span>
            <span className="block">
              This action can’t be undone.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="px-6 py-5 bg-slate-50 border-t border-slate-100">
          <AlertDialogCancel
            disabled={isDeleting}
            className="border-slate-200 text-slate-700 hover:bg-white"
          >
            Keep Article
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault()
              if (!isDeleting) {
                void handleDelete()
              }
            }}
            className="bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500"
          >
            {isDeleting ? 'Deleting...' : 'Delete Article'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
