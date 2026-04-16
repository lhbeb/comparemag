import { ProductCardEditor } from '@/components/admin/product-card-editor'
import { getProductBySlug } from '@/lib/supabase/products'
import { notFound } from 'next/navigation'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string }
}) {
  const resolvedParams = await Promise.resolve(params)
  const productData = await getProductBySlug(resolvedParams.slug)

  if (!productData) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <ProductCardEditor initialData={productData} mode="edit" />
      </div>
    </div>
  )
}
