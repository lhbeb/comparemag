'use client'

import { ProductCardEditor } from '@/components/admin/product-card-editor'

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <ProductCardEditor mode="create" />
      </div>
    </div>
  )
}
