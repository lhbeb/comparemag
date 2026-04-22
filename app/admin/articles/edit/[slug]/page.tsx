import { ArticleEditor } from '@/components/admin/article-editor'
import { getAllWriters } from '@/lib/supabase/writers'
import { getAllProducts } from '@/lib/supabase/products'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

async function getArticle(slug: string) {
  try {
    const supabase = await import('@/lib/supabase/server').then(m => m.createClient())
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !data) {
      return null
    }

    return data
  } catch (error) {
    return null
  }
}

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string }
}) {
  const resolvedParams = await Promise.resolve(params)
  
  const [article, writers, products] = await Promise.all([
    getArticle(resolvedParams.slug),
    getAllWriters(),
    getAllProducts(false)
  ])

  if (!article) {
    notFound()
  }

  return (
    <div className="w-full">
      <ArticleEditor
        mode="edit"
        initialData={{
          originalSlug: article.slug,
          slug: article.slug,
          title: article.title,
          content: article.content,
          author: article.author,
          category: article.category,
          image_url: article.image_url,
          read_time: article.read_time,
          published: article.published,
          meta_description: article.meta_description,
          meta_keywords: article.meta_keywords,
          focus_keyword: article.focus_keyword,
          og_title: article.og_title,
          og_description: article.og_description,
          og_image: article.og_image,
          canonical_url: article.canonical_url,
          article_type: article.article_type,
          generation_status: article.generation_status,
          listed_by: article.listed_by,
          published_at: article.published_at,
        }}
        initialWriters={writers}
        initialProducts={products}
      />
    </div>
  )
}
