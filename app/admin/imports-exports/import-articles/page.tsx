import { ArticleImportButton } from '@/components/admin/article-import-button'

export default function ImportArticlesPage() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Import Articles</h1>
        <p className="text-slate-500 mt-2">
          Upload a CompareMag article export file to create or update an article with its full editor settings and HTML-ready content.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
        <div className="max-w-2xl">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Accepts exported article JSON</h2>
          <p className="text-sm leading-6 text-slate-600 mb-6">
            The importer accepts the article export file from the admin dashboard. If the imported slug already exists,
            the article is updated in place. If it does not exist, a new article is created.
          </p>

          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6">
            <ArticleImportButton className="bg-slate-900 text-white hover:bg-slate-800" variant="default" />
          </div>
        </div>
      </div>
    </div>
  )
}
