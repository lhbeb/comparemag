import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getAllArticlesOverview } from '@/lib/supabase/articles'
import { Plus } from 'lucide-react'

async function getArticles() {
  try {
    return await getAllArticlesOverview(false)
  } catch (error) {
    console.error('Error fetching articles:', error)
    return []
  }
}

import { ArticlesFilters } from '@/components/admin/articles-filters'

export default async function AdminPage() {
  const articles = await getArticles()
  const published = articles.filter((a) => a.published).length
  const drafts = articles.filter((a) => !a.published).length

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1
          className="text-2xl font-bold mb-1"
          style={{ color: 'var(--content-text)', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.025em' }}
        >
          Articles
        </h1>
        <p className="text-sm" style={{ color: 'var(--content-text-secondary)' }}>
          Manage reviews, news, and price comparison articles
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total', value: articles.length, color: 'var(--admin-primary)', bg: 'var(--admin-primary-light)' },
          { label: 'Published', value: published, color: 'var(--admin-success)', bg: 'var(--admin-success-bg)' },
          { label: 'Drafts/Generated', value: drafts, color: 'var(--admin-draft-text)', bg: 'var(--admin-draft-bg)' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl px-5 py-4 flex items-center gap-4"
            style={{ background: 'var(--content-surface)', border: '1px solid var(--content-border)', boxShadow: 'var(--shadow-sm)' }}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold"
              style={{ background: stat.bg, color: stat.color }}
            >
              {stat.value}
            </div>
            <span className="text-sm font-medium" style={{ color: 'var(--content-text-secondary)' }}>{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <Button asChild style={{ background: 'var(--admin-primary)', color: 'white' }}>
          <Link href="/admin/articles/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Article
          </Link>
        </Button>
      </div>

      <ArticlesFilters articles={articles} />
    </div>
  )
}
