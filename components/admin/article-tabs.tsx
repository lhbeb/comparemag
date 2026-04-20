'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Edit, Eye, EyeOff, FileText, Wand2, Trash2 } from 'lucide-react'
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
}

export function ArticleTabs({ articles }: ArticleTabsProps) {
  const [localArticles, setLocalArticles] = React.useState(articles)

  React.useEffect(() => {
    setLocalArticles(articles)
  }, [articles])

  const published = localArticles.filter(a => a.published)
  const manualDrafts = localArticles.filter(a => !a.published && a.article_type !== 'programmatic')
  const generated = localArticles.filter(a => a.article_type === 'programmatic')

  const handleDeleted = React.useCallback((slug: string) => {
    setLocalArticles((current) => current.filter((article) => article.slug !== slug))
  }, [])

  return (
    <Tabs defaultValue="all" className="w-full">
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
        <ArticleList articles={localArticles} onDeleted={handleDeleted} />
      </TabsContent>
      <TabsContent value="published" className="mt-0">
        <ArticleList articles={published} onDeleted={handleDeleted} />
      </TabsContent>
      <TabsContent value="drafts" className="mt-0">
        <ArticleList articles={manualDrafts} onDeleted={handleDeleted} />
      </TabsContent>
      <TabsContent value="generated" className="mt-0">
        <ArticleList articles={generated} onDeleted={handleDeleted} />
      </TabsContent>
    </Tabs>
  )
}

function ArticleList({ articles, onDeleted }: { articles: any[], onDeleted: (slug: string) => void }) {
  if (articles.length === 0) {
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

  return (
    <div className="space-y-3">
      {articles.map((article) => (
        <div key={article.id} className="admin-card px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              
              {/* Thumbnail */}
              <div className="relative w-14 h-14 flex-shrink-0 rounded-md overflow-hidden border border-slate-200 shadow-sm bg-slate-100 hidden sm:block">
                <SupabaseImage 
                  src={article.image_url || "/placeholder.svg"} 
                  alt="Thumbnail" 
                  fill 
                  className="object-cover" 
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                  {article.published ? (
                    <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                  ) : article.article_type === 'programmatic' ? (
                    <span className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-400 flex-shrink-0" />
                  )}
                  
                  <h2 className="font-semibold text-base leading-tight truncate text-slate-900">
                    {article.title}
                  </h2>
                  
                  {article.published ? (
                    <span className="status-published px-2 py-0.5 rounded-full inline-flex items-center gap-1 flex-shrink-0">
                      <Eye className="h-2.5 w-2.5" /> Published
                    </span>
                  ) : article.article_type === 'programmatic' ? (
                    <span className="status-generated px-2 py-0.5 rounded-full inline-flex items-center gap-1 flex-shrink-0">
                      <Wand2 className="h-2.5 w-2.5" /> Generated
                    </span>
                  ) : (
                    <span className="status-draft px-2 py-0.5 rounded-full inline-flex items-center gap-1 flex-shrink-0">
                      <EyeOff className="h-2.5 w-2.5" /> Draft
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-3 text-xs flex-wrap text-slate-500">
                  <span className="px-2 py-0.5 rounded-md font-medium bg-blue-50 text-blue-700">
                    {article.category}
                  </span>
                  <span>By <strong className="text-slate-900">{article.author}</strong></span>
                  {article.listed_by && (
                    <span className="px-1.5 py-0.5 rounded-sm bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider border border-indigo-100 flex items-center gap-1" title="Listed By">
                      [L] {article.listed_by}
                    </span>
                  )}
                  <span className="text-slate-300">·</span>
                  <span>{format(new Date(article.created_at), 'MMM d, yyyy')}</span>
                  <span className="text-slate-300">·</span>
                  <code className="font-mono text-[11px] truncate max-w-[200px] inline-block align-bottom">{article.slug}</code>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Button variant="outline" size="sm" asChild className="h-8 px-3 text-xs font-medium border-slate-200 text-slate-700">
                <Link href={`/admin/articles/edit/${article.slug}`}>
                  <Edit className="h-3.5 w-3.5 mr-1.5" />
                  Edit
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="h-8 px-3 text-xs font-medium border-slate-200 text-slate-700">
                <Link href={`/blog/${article.slug}`} target="_blank">
                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                  View
                </Link>
              </Button>
              <DeleteArticleButton slug={article.slug} title={article.title} onDeleted={onDeleted} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function DeleteArticleButton({
  slug,
  title,
  onDeleted,
}: {
  slug: string
  title: string
  onDeleted: (slug: string) => void
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
        className="h-8 px-3 text-xs font-medium border-slate-200 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
      >
        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
        {isDeleting ? 'Deleting...' : 'Delete'}
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
