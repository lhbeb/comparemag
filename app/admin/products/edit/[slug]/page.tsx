'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ProductCardEditor } from '@/components/admin/product-card-editor'

export default function EditProductPage() {
  const params = useParams()
  const [productData, setProductData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProduct() {
      try {
        const slug = params.slug as string
        const res = await fetch(`/api/products/${slug}`)
        if (res.ok) {
          const data = await res.json()
          setProductData(data)
        } else {
          console.error("Product not found")
        }
      } catch (error) {
        console.error('Failed to fetch product', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [params.slug])

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading editor...</div>
  }

  if (!productData) {
    return <div className="p-8 text-center text-red-500">Product not found.</div>
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <ProductCardEditor initialData={productData} mode="edit" />
      </div>
    </div>
  )
}
