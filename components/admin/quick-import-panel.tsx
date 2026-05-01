'use client'

import { useState, useRef } from 'react'
import { Zap, X, Upload, Loader2, CheckCircle2, AlertCircle, FileJson } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/use-toast'

interface QuickImportResult {
  slug: string
  title: string
  status: 'success' | 'error' | 'skipped'
  message?: string
}

interface ImportSummary {
  total: number
  imported: number
  skipped: number
  failed: number
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

async function fetchOgImage(url: string): Promise<string | null> {
  try {
    const res = await fetch('/api/products/og-image?url=' + encodeURIComponent(url))
    if (!res.ok) return null
    const data = await res.json()
    return data.image || null
  } catch {
    return null
  }
}

const PLACEHOLDER_JSON = `[
  {
    "brand_name": "Canon",
    "product_display_name": "Canon PowerShot G7 X Mark III",
    "short_note": "Create high-quality content effortlessly with this compact powerhouse.",
    "price_label": "$371.00",
    "affiliate_link_url": "https://yourstore.com/products/canon-powershot-g7x-mark-iii",
    "listed_by": "janah"
  }
]`

export function QuickImportPanel({ onImported }: { onImported: () => void }) {
  const [open, setOpen] = useState(false)
  const [json, setJson] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<QuickImportResult[]>([])
  const [summary, setSummary] = useState<ImportSummary | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetPanel = () => {
    setJson('')
    setResults([])
    setSummary(null)
    setLoading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string
        // Optionally validate JSON format immediately, but setting it allows user edits
        setJson(content)
      } catch (error) {
        toast({ title: 'Read Error', description: 'Failed to read file.', variant: 'destructive' })
      }
    }
    reader.readAsText(file)
    // Clear input so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleImport = async () => {
    let parsed: any[]
    try {
      parsed = JSON.parse(json)
      if (!Array.isArray(parsed)) parsed = [parsed]
    } catch {
      toast({ title: 'Invalid JSON', description: 'Please paste valid JSON to import.', variant: 'destructive' })
      return
    }

    setLoading(true)
    setResults([])
    setSummary(null)
    const importResults: QuickImportResult[] = []
    const seenSlugs = new Set<string>()
    let existingSlugs = new Set<string>()

    try {
      const existingRes = await fetch('/api/products?full=true&published=false', { cache: 'no-store' })
      if (existingRes.ok) {
        const existingProducts = await existingRes.json()
        existingSlugs = new Set(
          (Array.isArray(existingProducts) ? existingProducts : [])
            .map((product: any) => product?.slug)
            .filter(Boolean)
        )
      }
    } catch {
      // If this lookup fails, we still continue and let the per-item API response decide.
    }

    for (const item of parsed) {
      // Map new schema → internal fields
      const title = item.product_display_name || item.title
      const brand = item.brand_name || item.brand || null
      const shortDesc = item.short_note || item.short_description || ''
      const priceText = item.price_label || item.price_text || null
      const externalUrl = item.affiliate_link_url || item.external_url

      if (!title || !externalUrl) {
        importResults.push({
          slug: item.slug || title || 'unknown',
          title: title || 'Unknown',
          status: 'error',
          message: 'Missing required fields: product_display_name, affiliate_link_url',
        })
        continue
      }

      const slug = item.slug || slugify(title)
      const normalizedTitle = title || 'Unknown'

      if (!slug) {
        importResults.push({
          slug: 'unknown',
          title: normalizedTitle,
          status: 'error',
          message: 'Could not generate a usable slug for this product.',
        })
        continue
      }

      if (seenSlugs.has(slug)) {
        importResults.push({
          slug,
          title: normalizedTitle,
          status: 'skipped',
          message: 'Skipped: duplicate slug detected inside this same import batch.',
        })
        continue
      }
      seenSlugs.add(slug)

      if (existingSlugs.has(slug)) {
        importResults.push({
          slug,
          title: normalizedTitle,
          status: 'skipped',
          message: 'Skipped: this product already exists in the database.',
        })
        continue
      }

      // Try to fetch OG image from the product URL
      let imageUrl = item.image_url || null
      if (!imageUrl && externalUrl) {
        imageUrl = await fetchOgImage(externalUrl)
      }

      const payload = {
        slug,
        title,
        brand,
        image_url: imageUrl,
        short_description: shortDesc,
        cta_label: item.cta_label || 'Get Deal',
        external_url: externalUrl,
        price_text: priceText,
        rating_text: item.rating_text || null,
        badge_text: item.badge_text || 'Smart Choice',
        specs: item.specs || null,
        listed_by: item.listed_by || null,
        published: item.published ?? true,
      }

      try {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (res.ok) {
          importResults.push({ slug, title: normalizedTitle, status: 'success', message: 'Imported successfully.' })
          existingSlugs.add(slug)
        } else {
          const err = await res.json()
          const apiMessage = err.error || 'API error'
          const isDuplicate = /duplicate key value violates unique constraint .*product_cards_slug_key/i.test(apiMessage)
          importResults.push({
            slug,
            title: normalizedTitle,
            status: isDuplicate ? 'skipped' : 'error',
            message: isDuplicate
              ? 'Skipped: this product already exists in the database.'
              : apiMessage,
          })
        }
      } catch (e) {
        importResults.push({ slug, title: normalizedTitle, status: 'error', message: 'Network error' })
      }
    }

    setResults(importResults)
    setLoading(false)

    const successes = importResults.filter(r => r.status === 'success').length
    const skipped = importResults.filter(r => r.status === 'skipped').length
    const failed = importResults.filter(r => r.status === 'error').length

    setSummary({
      total: importResults.length,
      imported: successes,
      skipped,
      failed,
    })

    if (successes > 0 || skipped > 0) {
      toast({
        title: 'Import finished',
        description: `${successes} imported, ${skipped} skipped, ${failed} failed.`,
      })
      onImported()
    } else if (failed > 0) {
      toast({
        title: 'Import finished with errors',
        description: `${failed} product${failed > 1 ? 's' : ''} failed and nothing new was imported.`,
        variant: 'destructive',
      })
    }
  }

  if (!open) {
    return (
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="border-blue-200 text-blue-700 hover:bg-blue-50 gap-2"
      >
        <Zap className="h-4 w-4" />
        Quick Import
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <Zap className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Quick Import Products</h2>
              <p className="text-sm text-slate-500">Paste JSON or upload a .json file — images are pulled from product URLs automatically</p>
            </div>
          </div>
          <button onClick={() => { setOpen(false); resetPanel() }} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">
                JSON Data <span className="text-slate-400 font-normal">(single object or array)</span>
              </label>
              
              <div>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fileInputRef.current?.click()}
                  className="h-8 gap-2 text-xs"
                >
                  <FileJson className="h-4 w-4" />
                  Upload .json file
                </Button>
              </div>
            </div>
            <Textarea
              value={json}
              onChange={(e) => setJson(e.target.value)}
              placeholder={PLACEHOLDER_JSON}
              className="font-mono text-xs min-h-[260px] bg-slate-50 border-slate-200 focus:bg-white resize-none"
            />
            <p className="text-xs text-slate-400 mt-2">
              Required: <code className="bg-slate-100 px-1 rounded">product_display_name</code>, <code className="bg-slate-100 px-1 rounded">affiliate_link_url</code>. Optional: brand_name, price_label, short_note, listed_by, rating_text, specs, badge_text, cta_label.
            </p>
          </div>

          {/* Results */}
          {summary && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="font-bold text-slate-900">Import Summary</span>
                <span className="text-emerald-700 font-semibold">{summary.imported} imported</span>
                <span className="text-amber-700 font-semibold">{summary.skipped} skipped</span>
                <span className="text-red-700 font-semibold">{summary.failed} failed</span>
                <span className="text-slate-500">out of {summary.total}</span>
              </div>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Import Results</p>
              {results.map((r, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-lg text-sm ${
                  r.status === 'success'
                    ? 'bg-green-50 border border-green-100'
                    : r.status === 'skipped'
                      ? 'bg-amber-50 border border-amber-100'
                      : 'bg-red-50 border border-red-100'
                }`}>
                  {r.status === 'success' ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${r.status === 'skipped' ? 'text-amber-600' : 'text-red-500'}`} />
                  )
                  }
                  <div>
                    <span className={`font-medium ${
                      r.status === 'success'
                        ? 'text-green-800'
                        : r.status === 'skipped'
                          ? 'text-amber-800'
                          : 'text-red-700'
                    }`}>{r.title}</span>
                    {r.message && (
                      <p className={`text-xs mt-0.5 ${
                        r.status === 'success'
                          ? 'text-green-700'
                          : r.status === 'skipped'
                            ? 'text-amber-700'
                            : 'text-red-600'
                      }`}>{r.message}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100">
          {results.length > 0 ? (
            <Button variant="outline" onClick={resetPanel}>Start New Import</Button>
          ) : (
            <Button variant="ghost" onClick={() => { setOpen(false); resetPanel() }}>Cancel</Button>
          )}
          <Button
            onClick={handleImport}
            disabled={loading || !json.trim()}
            className="bg-blue-600 hover:bg-blue-700 !text-white gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {loading ? 'Importing...' : 'Import Products'}
          </Button>
        </div>
      </div>
    </div>
  )
}
