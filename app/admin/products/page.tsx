'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PlusCircle, Search, Edit2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'

interface ProductCard {
  id: string
  slug: string
  title: string
  brand: string | null
  published: boolean
  created_at: string
}

import { ProductTabs } from '@/components/admin/product-tabs'

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductCard[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products')
      if (res.ok) {
        const data = await res.json()
        setProducts(data || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this product card?')) return
    
    try {
      const res = await fetch(`/api/products/${slug}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      
      toast({ title: 'Product deleted', description: 'Product card has been removed.' })
      setProducts(products.filter(p => p.slug !== slug))
    } catch (e) {
      toast({ title: 'Error', description: 'Could not delete product.', variant: 'destructive' })
    }
  }

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans" style={{ letterSpacing: '-0.025em' }}>Product Cards</h1>
          <p className="text-sm text-slate-500 mt-1">Manage product cards for embeddings and comparisons.</p>
        </div>
        <Button asChild className="bg-blue-600 hover:bg-blue-700 !text-white">
          <Link href="/admin/products/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Product Card
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search products..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-20 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
           <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
           Loading products...
        </div>
      ) : (
        <ProductTabs products={filteredProducts} onDelete={handleDelete} />
      )}
    </div>
  )
}
