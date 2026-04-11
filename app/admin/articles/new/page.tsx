import { ArticleEditor } from '@/components/admin/article-editor'

export default function NewArticlePage() {
  return (
    <div className="w-full">
      <ArticleEditor mode="create" />
    </div>
  )
}
