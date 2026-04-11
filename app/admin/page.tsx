import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getAllArticles } from '@/lib/supabase/articles'
import { getAllProducts } from '@/lib/supabase/products'
import { getAllWriters } from '@/lib/supabase/writers'
import { FileText, Users, ShoppingBag, Wand2, Plus, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'

export const dynamic = 'force-dynamic'

async function getDashboardData() {
  const [articles, products, writers] = await Promise.all([
    getAllArticles(false),
    getAllProducts(false),
    getAllWriters()
  ])

  // Process articles
  const publishedArticles = articles.filter((a: any) => a.published).length
  const manualDrafts = articles.filter((a: any) => !a.published && a.article_type !== 'programmatic').length
  const programmaticGenerated = articles.filter((a: any) => a.article_type === 'programmatic').length

  // Recent content across all types
  const recentArticles = articles.slice(0, 5)
  
  return {
    metrics: {
      totalArticles: articles.length,
      publishedArticles,
      manualDrafts,
      programmaticGenerated,
      totalProducts: products.length,
      totalWriters: writers.length
    },
    recentArticles
  }
}

export default async function AdminDashboardOverview() {
  const data = await getDashboardData()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans" style={{ letterSpacing: '-0.025em' }}>
          Dashboard Overview
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Welcome back. Here is the current status of your content and commerce blocks.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Published */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Live Articles</p>
              <h3 className="text-2xl font-bold text-slate-900">{data.metrics.publishedArticles}</h3>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-50 text-green-600">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <Link href="/admin/articles?tab=published" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group">
            View all published <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Manual Drafts */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Manual Drafts</p>
              <h3 className="text-2xl font-bold text-slate-900">{data.metrics.manualDrafts}</h3>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-50 text-slate-600">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <Link href="/admin/articles?tab=drafts" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group">
            Continue writing <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Programmatic Queue */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Auto-Generated</p>
              <h3 className="text-2xl font-bold text-slate-900">{data.metrics.programmaticGenerated}</h3>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-50 text-purple-600">
              <Wand2 className="w-5 h-5" />
            </div>
          </div>
          <Link href="/admin/programmatic/new" className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1 group">
            Generate more <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Products */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Product Cards</p>
              <h3 className="text-2xl font-bold text-slate-900">{data.metrics.totalProducts}</h3>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-orange-50 text-orange-600">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <Link href="/admin/products" className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 group">
            Manage catalog <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Activity List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Recent Articles</h2>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {data.recentArticles.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">No articles found.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {data.recentArticles.map((article: any) => (
                  <div key={article.id} className="p-4 hover:bg-slate-50 flex items-center justify-between transition-colors">
                    <div className="min-w-0 pr-4 flex-1">
                      <div className="flex items-center gap-2 mb-1 opacity-90">
                        {article.published ? (
                          <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                        ) : article.article_type === 'programmatic' ? (
                          <span className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-slate-400 flex-shrink-0" />
                        )}
                        <h4 className="text-sm font-semibold text-slate-900 truncate">{article.title}</h4>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="capitalize">{article.article_type === 'programmatic' ? 'Generated' : 'Manual'}</span>
                        <span>•</span>
                        <span>{format(new Date(article.updated_at), 'MMM d')}</span>
                        <span>•</span>
                        <span className="truncate">By {article.author}</span>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      asChild
                      className="flex-shrink-0 h-8"
                    >
                      <Link href={`/admin/articles/edit/${article.slug}`}>Edit</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <div className="p-3 border-t border-slate-100 bg-slate-50 text-center">
              <Link href="/admin/articles" className="text-xs font-semibold text-slate-600 hover:text-slate-900">
                View All Content
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
            <Button asChild className="w-full justify-start bg-blue-600 hover:bg-blue-700">
              <Link href="/admin/articles/new">
                <Plus className="w-4 h-4 mr-2" />
                Write New Article
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full justify-start border-slate-200 hover:bg-slate-50">
              <Link href="/admin/products/new">
                <Plus className="w-4 h-4 mr-2" />
                Add Product Card
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full justify-start border-slate-200 hover:bg-slate-50 text-purple-700 hover:text-purple-800">
              <Link href="/admin/programmatic/new">
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Bulk Stub
              </Link>
            </Button>

            <Button asChild variant="ghost" className="w-full justify-start text-slate-600 hover:bg-slate-100 mt-2">
              <Link href="/admin/writers/new">
                <Users className="w-4 h-4 mr-2" />
                Invite Editor
              </Link>
            </Button>
          </div>
        </div>

      </div>
    </div>
  )
}
