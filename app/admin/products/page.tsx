'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Globe, Loader2, PlusCircle, Search } from 'lucide-react'
import { QuickImportPanel } from '@/components/admin/quick-import-panel'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { ProductTabs } from '@/components/admin/product-tabs'

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

interface DomainReplaceResponse {
  fromDomain: string
  toDomain: string
  updatedProductCount: number
  updatedArticleCount: number
}

function getAffiliateDomain(url: string | null | undefined) {
  if (!url) return null

  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, '')
  } catch {
    return null
  }
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductCard[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [domainFilter, setDomainFilter] = useState('all')
  const [listedByFilter, setListedByFilter] = useState('all')
  const [replaceDialogOpen, setReplaceDialogOpen] = useState(false)
  const [replaceFromDomain, setReplaceFromDomain] = useState('deeldepot.com')
  const [replaceToDomain, setReplaceToDomain] = useState('casoodo.com')
  const [isReplacingDomain, setIsReplacingDomain] = useState(false)
  const [lastReplaceResult, setLastReplaceResult] = useState<DomainReplaceResponse | null>(null)

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

  const handleBulkDelete = async (slugs: string[]) => {
    if (!confirm(`Are you sure you want to delete ${slugs.length} product(s)?`)) return

    let deletedCount = 0
    try {
      await Promise.all(
        slugs.map(async (slug) => {
          const res = await fetch(`/api/products/${slug}`, { method: 'DELETE' })
          if (res.ok) deletedCount++
        })
      )
      toast({ title: 'Products deleted', description: `${deletedCount} product card(s) have been removed.` })
      setProducts(prev => prev.filter(p => !slugs.includes(p.slug)))
    } catch (e) {
      toast({ title: 'Error', description: 'Could not delete all products.', variant: 'destructive' })
      setProducts(prev => prev.filter(p => !slugs.includes(p.slug))) // Refresh optimistic if needed, or simply re-fetch
      fetchProducts()
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

  const handleDomainReplace = async () => {
    const fromDomain = replaceFromDomain.trim()
    const toDomain = replaceToDomain.trim()

    if (!fromDomain || !toDomain) {
      toast({
        title: 'Domains required',
        description: 'Add both the current domain and the replacement domain.',
        variant: 'destructive',
      })
      return
    }

    if (fromDomain.toLowerCase() === toDomain.toLowerCase()) {
      toast({
        title: 'Choose a different target domain',
        description: 'The replacement domain must be different from the current one.',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsReplacingDomain(true)

      const response = await fetch('/api/products/replace-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromDomain,
          toDomain,
        }),
      })

      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(payload?.error || 'Could not replace the product-card domain.')
      }

      setLastReplaceResult(payload)
      setReplaceDialogOpen(false)
      await fetchProducts()

      toast({
        title: 'Domain replacement complete',
        description: `${payload.updatedProductCount} product card(s) and ${payload.updatedArticleCount} article(s) were updated.`,
      })
    } catch (error) {
      toast({
        title: 'Domain replacement failed',
        description: error instanceof Error ? error.message : 'Could not update product card domains.',
        variant: 'destructive',
      })
    } finally {
      setIsReplacingDomain(false)
    }
  }

  const filteredProducts = products.filter(p =>
    (
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (getAffiliateDomain(p.external_url)?.includes(searchQuery.toLowerCase()) ?? false)
    ) &&
    (domainFilter === 'all' || getAffiliateDomain(p.external_url) === domainFilter) &&
    (listedByFilter === 'all' || (p.listed_by || 'unassigned') === listedByFilter)
  )

  const availableDomains = Array.from(
    new Set(
      products
        .map((product) => getAffiliateDomain(product.external_url))
        .filter((domain): domain is string => Boolean(domain))
    )
  ).sort()

  const availableStaff = Array.from(
    new Set(
      products
        .map((p) => p.listed_by || 'unassigned')
    )
  ).sort()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans" style={{ letterSpacing: '-0.025em' }}>Product Cards</h1>
          <p className="text-sm text-slate-500 mt-1">Manage product cards for embeddings and comparisons.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            className="border-slate-200 bg-white"
            onClick={() => setReplaceDialogOpen(true)}
          >
            <Globe className="mr-2 h-4 w-4" />
            Replace Domain
          </Button>
          <QuickImportPanel onImported={fetchProducts} />
          <Button asChild className="bg-blue-600 hover:bg-blue-700 !text-white">
            <Link href="/admin/products/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Product Card
            </Link>
          </Button>
        </div>
      </div>

      {lastReplaceResult ? (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-950">
          Replaced <span className="font-semibold">{lastReplaceResult.fromDomain}</span> with{' '}
          <span className="font-semibold">{lastReplaceResult.toDomain}</span> in{' '}
          <span className="font-semibold">{lastReplaceResult.updatedProductCount}</span> product card(s) and{' '}
          <span className="font-semibold">{lastReplaceResult.updatedArticleCount}</span> article(s). Product slugs were left unchanged.
        </div>
      ) : null}

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
        <div className="flex gap-3 flex-col sm:flex-row">
          <div className="w-full sm:w-[220px]">
            <Select value={listedByFilter} onValueChange={setListedByFilter}>
              <SelectTrigger className="bg-slate-50 border-slate-200">
                <SelectValue placeholder="Filter by staff" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All staff</SelectItem>
                {availableStaff.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name === 'unassigned' ? '— Unassigned' : name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-[220px]">
            <Select value={domainFilter} onValueChange={setDomainFilter}>
              <SelectTrigger className="bg-slate-50 border-slate-200">
                <SelectValue placeholder="Filter by domain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All domains</SelectItem>
                {availableDomains.map((domain) => (
                  <SelectItem key={domain} value={domain}>
                    {domain}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-20 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
           <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
           Loading products...
        </div>
      ) : (
        <ProductTabs products={filteredProducts} onDelete={handleDelete} onBulkDelete={handleBulkDelete} />
      )}

      <Dialog open={replaceDialogOpen} onOpenChange={setReplaceDialogOpen}>
        <DialogContent className="rounded-2xl border-slate-200 sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Replace Product Card Domain</DialogTitle>
            <DialogDescription className="text-slate-600">
              This bulk action updates matching domains inside <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">product_cards.external_url</code>{' '}
              and article body content where those product links are stored inline. Product slugs stay exactly as they are.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <label htmlFor="replace-from-domain" className="text-sm font-medium text-slate-800">
                Current domain
              </label>
              <Input
                id="replace-from-domain"
                value={replaceFromDomain}
                onChange={(event) => setReplaceFromDomain(event.target.value)}
                placeholder="deeldepot.com"
                className="bg-slate-50 border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="replace-to-domain" className="text-sm font-medium text-slate-800">
                Replacement domain
              </label>
              <Input
                id="replace-to-domain"
                value={replaceToDomain}
                onChange={(event) => setReplaceToDomain(event.target.value)}
                placeholder="casoodo.com"
                className="bg-slate-50 border-slate-200"
              />
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Existing product-card shortcodes like <code className="rounded bg-white px-1 py-0.5 text-xs">[product-card:slug]</code> keep working because this action only changes the stored destination URLs, not the slugs.
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="border-slate-200"
              onClick={() => setReplaceDialogOpen(false)}
              disabled={isReplacingDomain}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 !text-white"
              onClick={handleDomainReplace}
              disabled={isReplacingDomain}
            >
              {isReplacingDomain ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Replacing…
                </>
              ) : (
                'Run Replacement'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
