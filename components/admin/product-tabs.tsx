'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Edit2, Trash2, ShoppingBag, Eye, EyeOff, Image as ImageIcon, User2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs'
import { SupabaseImage } from '@/components/supabase-image'

interface ProductCard {
  id: string
  slug: string
  title: string
  brand: string | null
  image_url: string | null
  external_url: string
  published: boolean
  listed_by: string | null
  created_at: string
}

interface ProductTabsProps {
  products: ProductCard[]
  onDelete: (slug: string) => void
}

export function ProductTabs({ products, onDelete }: ProductTabsProps) {
  const published = products.filter(p => p.published)
  const drafts = products.filter(p => !p.published)

  return (
    <Tabs defaultValue="all" className="w-full">
      <div className="flex items-center justify-between mb-4">
        <TabsList className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg">
          <TabsTrigger value="all" className="px-4 py-1.5 text-sm font-semibold text-slate-600 rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm transition-all">
            All ({products.length})
          </TabsTrigger>
          <TabsTrigger value="published" className="px-4 py-1.5 text-sm font-semibold text-slate-600 rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm transition-all">
            Published ({published.length})
          </TabsTrigger>
          <TabsTrigger value="drafts" className="px-4 py-1.5 text-sm font-semibold text-slate-600 rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm transition-all">
            Drafts ({drafts.length})
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="all" className="mt-0">
        <ProductList products={products} onDelete={onDelete} />
      </TabsContent>
      <TabsContent value="published" className="mt-0">
        <ProductList products={published} onDelete={onDelete} />
      </TabsContent>
      <TabsContent value="drafts" className="mt-0">
        <ProductList products={drafts} onDelete={onDelete} />
      </TabsContent>
    </Tabs>
  )
}

function getAffiliateDomain(url: string | null | undefined) {
  if (!url) return null

  try {
    const hostname = new URL(url).hostname.toLowerCase().replace(/^www\./, '')
    return hostname
  } catch {
    return null
  }
}

function ProductList({ products, onDelete }: { products: ProductCard[], onDelete: (slug: string) => void }) {
  if (products.length === 0) {
    return (
      <div className="text-center py-20 rounded-2xl flex flex-col items-center gap-4 bg-white border border-dashed border-slate-200">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-orange-50">
          <ShoppingBag className="h-7 w-7 text-orange-600" />
        </div>
        <div>
          <p className="font-semibold mb-1 text-slate-900">No products found</p>
          <p className="text-sm text-slate-500">There are no product cards in this category.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 font-semibold">Product info</th>
              <th className="px-6 py-4 font-semibold text-center">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  {(() => {
                    const affiliateDomain = getAffiliateDomain(product.external_url)

                    return (
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shadow-sm">
                      {product.image_url ? (
                        <SupabaseImage
                          src={product.image_url}
                          alt={product.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-5 w-5 text-slate-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-slate-900 text-base line-clamp-2">{product.title}</span>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-medium text-slate-500">{product.brand || 'No brand'}</span>
                        {affiliateDomain ? (
                          <span className="inline-flex items-center rounded-full border border-orange-100 bg-orange-50 px-2 py-0.5 font-medium text-orange-700">
                            {affiliateDomain}
                          </span>
                        ) : null}
                        {product.listed_by && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-purple-100 bg-purple-50 px-2 py-0.5 font-medium text-purple-700">
                            <User2 className="h-2.5 w-2.5" />
                            {product.listed_by}
                          </span>
                        )}
                      </div>
                      <div className="mt-2">
                         <code className="inline-block max-w-full truncate rounded border !border-slate-200 !bg-slate-50 px-2 py-0.5 font-mono text-[10px] !text-slate-500">
                          [product-card:{product.slug}]
                        </code>
                      </div>
                    </div>
                  </div>
                    )
                  })()}
                </td>
                <td className="px-6 py-4 text-center">
                  {product.published ? (
                    <span className="status-published">
                      <Eye className="w-3 h-3 mr-1" /> Published
                    </span>
                  ) : (
                    <span className="status-draft">
                      <EyeOff className="w-3 h-3 mr-1" /> Draft
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="outline" size="sm" asChild className="h-8 px-3 text-xs font-medium border-slate-200">
                      <Link href={`/admin/products/edit/${product.slug}`}>
                        <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onDelete(product.slug)}
                      className="h-8 px-3 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
