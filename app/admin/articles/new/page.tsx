import { ArticleEditor } from '@/components/admin/article-editor'
import { getAllWriters } from '@/lib/supabase/writers'
import { getAllProductsOverview } from '@/lib/supabase/products'

export default async function NewArticlePage() {
  // Fetch dependencies securely on the server to prevent client-side stalls when opening modals
  const [writers, products] = await Promise.all([
    getAllWriters(),
    getAllProductsOverview(true)
  ])

  return (
    <div className="w-full">
      <ArticleEditor 
        mode="create" 
        initialWriters={writers} 
        initialProducts={products}
      />
    </div>
  )
}
