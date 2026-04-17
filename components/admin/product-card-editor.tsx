'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  Upload, X, Save, Send, ShoppingBag, 
  Tag, ExternalLink, Star, Image as ImageIcon, 
  Settings, Info, Code, RefreshCw
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'

interface ProductCardEditorProps {
  initialData?: {
    slug: string
    title: string
    brand: string | null
    image_url: string | null
    short_description: string
    cta_label: string | null
    external_url: string
    price_text: string | null
    rating_text: string | null
    badge_text: string | null
    specs: any | null
    published: boolean
  }
  mode: 'create' | 'edit'
}

export function ProductCardEditor({ initialData, mode }: ProductCardEditorProps) {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState(initialData?.title || '')
  const [slug, setSlug] = useState(initialData?.slug || '')
  const [brand, setBrand] = useState(initialData?.brand || '')
  const [shortDesc, setShortDesc] = useState(initialData?.short_description || '')
  const [ctaLabel, setCtaLabel] = useState(initialData?.cta_label || 'Check Price')
  const [externalUrl, setExternalUrl] = useState(initialData?.external_url || '')
  const [priceText, setPriceText] = useState(initialData?.price_text || '')
  const [ratingText, setRatingText] = useState(initialData?.rating_text || '')
  const [badgeText, setBadgeText] = useState(initialData?.badge_text || '')
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || '')
  const [specs, setSpecs] = useState(initialData?.specs ? JSON.stringify(initialData.specs, null, 2) : '')
  
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [fetchingMetadataImage, setFetchingMetadataImage] = useState(false)

  const generateSlug = (text: string) => text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (mode === 'create' && !initialData?.slug) setSlug(generateSlug(value))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    if (!file.type.startsWith('image/')) { toast({ title: 'Invalid file type', variant: 'destructive' }); return }
    setUploading(true)
    try {
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${file.name.split('.').pop()}`
      const { error: uploadError } = await supabase.storage.from('article_images').upload(`products/${fileName}`, file)
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('article_images').getPublicUrl(`products/${fileName}`)
      setImageUrl(data.publicUrl)
      toast({ title: 'Image uploaded' })
    } catch (error: any) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' })
    } finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = '' }
  }

  const handleSave = async (publish: boolean = false) => {
    if (!title || !slug || !shortDesc || !externalUrl) {
      toast({ title: 'Missing fields', description: 'Title, Slug, Description, and Link are required.', variant: 'destructive' })
      return
    }
    let parsedSpecs = null
    if (specs) {
      try { parsedSpecs = JSON.parse(specs) } 
      catch (err) { toast({ title: 'Invalid specs JSON', variant: 'destructive' }); return }
    }
    publish ? setPublishing(true) : setSaving(true)
    try {
      const payload = {
        slug, title, brand: brand || null, short_description: shortDesc,
        cta_label: ctaLabel || 'Check Price', external_url: externalUrl,
        price_text: priceText || null, rating_text: ratingText || null,
        badge_text: badgeText || null, image_url: imageUrl || null,
        specs: parsedSpecs, published: publish,
      }
      const response = await fetch(mode === 'create' ? '/api/products' : `/api/products/${initialData?.slug}`, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) throw new Error('Failed to save product')
      toast({ title: publish ? 'Product published!' : 'Product saved' })
      router.push('/admin/products'); router.refresh()
    } catch (error: any) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' })
    } finally { setSaving(false); setPublishing(false) }
  }

  const handlePullImageFromMetadata = async () => {
    if (!externalUrl.trim()) {
      toast({
        title: 'Missing product URL',
        description: 'Add the affiliate/product link first so we can inspect its metadata.',
        variant: 'destructive',
      })
      return
    }

    setFetchingMetadataImage(true)
    try {
      const response = await fetch('/api/products/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: externalUrl.trim() }),
      })

      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(payload?.message || 'Could not pull preview image from product metadata.')
      }

      if (!payload?.image_url) {
        throw new Error('No metadata image was returned for this product URL.')
      }

      setImageUrl(payload.image_url)
      toast({
        title: 'Preview image imported',
        description: 'The product card image was pulled from the product page metadata.',
      })
    } catch (error: any) {
      toast({
        title: 'Metadata fetch failed',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setFetchingMetadataImage(false)
    }
  }

  return (
    <div className="cms-editor-layout">
      {/* ── Main content (Left) ─────────────────────────────────── */}
      <div className="space-y-6">
        {/* Brand & Title */}
        <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
                <Tag className="w-4 h-4 text-slate-400" />
                <input 
                    value={brand} 
                    onChange={(e) => setBrand(e.target.value)} 
                    placeholder="Brand Name (e.g. Sony)..." 
                    className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-transparent border-none p-0 focus:ring-0"
                />
            </div>
            <Input
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Product Display Name..."
                className="text-3xl font-bold h-auto py-2 border-none bg-transparent hover:bg-slate-50 focus:bg-white transition-all shadow-none placeholder:text-slate-300"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            />
            <div className="flex items-center gap-1.5 px-1">
                <Code className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-400 font-medium">Internal ID (Slug):</span>
                <input 
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="text-xs font-mono text-blue-600 bg-transparent border-none p-0 focus:ring-0 flex-1"
                />
            </div>
        </div>

        {/* Short Description Card */}
        <div className="cms-sidebar-card shadow-sm border-slate-200">
          <div className="cms-sidebar-card-header bg-slate-50 border-b-slate-100 py-3 px-5">
            Content Details
            <Info className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="cms-sidebar-card-body p-6 space-y-6">
            <div className="space-y-2">
              <Label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Product Summary</Label>
              <Textarea
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                placeholder="Write a concise overview of this product's key selling points..."
                className="min-h-[120px] bg-white border-slate-200 text-sm leading-relaxed text-slate-700"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Product Specifications (JSON)</Label>
              <div className="relative group">
                <Textarea
                  value={specs}
                  onChange={(e) => setSpecs(e.target.value)}
                  placeholder='{ "Battery": "14h", "Weight": "2.4 lbs" }'
                  className="min-h-[220px] font-mono bg-slate-900 text-blue-400 border-none p-6 text-xs leading-relaxed selection:bg-blue-500/30"
                />
                <div className="absolute right-3 bottom-3 opacity-40 group-hover:opacity-100 transition-opacity">
                    <Code className="w-4 h-4 text-slate-500" />
                </div>
              </div>
              <p className="text-[10px] text-slate-400">Validated as JSON object for comparison engines.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sidebar (Right) ───────────────────────────────────── */}
      <aside className="space-y-6 lg:sticky lg:top-24">
        
        {/* Actions Card */}
        <div className="cms-sidebar-card">
          <div className="cms-sidebar-card-header">
            Management
            <Settings className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="cms-sidebar-card-body space-y-4">
             <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-500">Live Status:</span>
                <span className={initialData?.published ? 'status-published' : 'status-draft'}>
                    {initialData?.published ? 'Published' : 'Draft'}
                </span>
             </div>
             
             <div className="space-y-3 pt-2">
                <Button 
                    onClick={() => handleSave(true)} 
                    disabled={saving || publishing}
                    className="w-full bg-blue-600 hover:bg-blue-700 h-10 font-bold text-white"
                >
                    <Send className="mr-2 h-4 w-4" />
                    {publishing ? 'Updating...' : 'Publish Product'}
                </Button>
                <Button
                    variant="outline"
                    className="w-full border-slate-200 h-10 font-semibold"
                    onClick={() => handleSave(false)}
                    disabled={saving || publishing}
                >
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? 'Saving...' : 'Keep as Draft'}
                </Button>
             </div>
          </div>
        </div>

        {/* Commerce Details Card */}
        <div className="cms-sidebar-card">
          <div className="cms-sidebar-card-header">
            Price & Affiliate
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="cms-sidebar-card-body space-y-5">
             <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <Label className="text-[10px] text-slate-400 uppercase">Price Label</Label>
                    <Input 
                        value={priceText} 
                        onChange={(e) => setPriceText(e.target.value)} 
                        placeholder="$299" 
                        className="bg-slate-50 border-slate-200 font-bold" 
                    />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-[10px] text-slate-400 uppercase">Rating</Label>
                    <div className="relative">
                        <Star className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                        <Input 
                            value={ratingText} 
                            onChange={(e) => setRatingText(e.target.value)} 
                            placeholder="4.8/5" 
                            className="pl-8 bg-slate-50 border-slate-200 font-bold" 
                        />
                    </div>
                </div>
             </div>

             <div className="space-y-1.5">
                <Label className="text-[10px] text-slate-400 uppercase">Affiliate Link URL</Label>
                <Input 
                    value={externalUrl} 
                    onChange={(e) => setExternalUrl(e.target.value)} 
                    placeholder="https://..." 
                    className="bg-slate-50 border-slate-200 text-xs" 
                />
                <Button
                    type="button"
                    variant="outline"
                    onClick={handlePullImageFromMetadata}
                    disabled={fetchingMetadataImage || !externalUrl.trim()}
                    className="w-full border-slate-200 text-xs font-semibold"
                >
                    <RefreshCw className={`mr-2 h-3.5 w-3.5 ${fetchingMetadataImage ? 'animate-spin' : ''}`} />
                    {fetchingMetadataImage ? 'Pulling preview image...' : 'Pull Preview Image From Link'}
                </Button>
             </div>

             <div className="space-y-1.5">
                <Label className="text-[10px] text-slate-400 uppercase">Button Label</Label>
                <Input 
                    value={ctaLabel} 
                    onChange={(e) => setCtaLabel(e.target.value)} 
                    placeholder="Check Price" 
                    className="bg-slate-50 border-slate-200 font-semibold" 
                />
             </div>
             
             <div className="space-y-1.5">
                <Label className="text-[10px] text-slate-400 uppercase">Badge Label</Label>
                <Input 
                    value={badgeText} 
                    onChange={(e) => setBadgeText(e.target.value)} 
                    placeholder="Best Choice" 
                    className="bg-orange-50 border-orange-100 text-orange-700 font-bold text-xs" 
                />
             </div>
          </div>
        </div>

        {/* Product Visual Card */}
        <div className="cms-sidebar-card">
          <div className="cms-sidebar-card-header">
            Visual Media
            <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="cms-sidebar-card-body space-y-4">
             <div 
                className="aspect-square w-full rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50 overflow-hidden group cursor-pointer relative shadow-inner"
                onClick={() => fileInputRef.current?.click()}
             >
                {imageUrl ? (
                  <>
                    <img src={imageUrl} className="w-full h-full object-contain p-4" alt={title} />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                       <Upload className="w-6 h-6 text-white" />
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Add Photo</p>
                  </div>
                )}
             </div>
             <input ref={fileInputRef} type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
             <Input 
                value={imageUrl} 
                onChange={(e) => setImageUrl(e.target.value)} 
                placeholder="Or paste external asset URL..." 
                className="text-[10px] bg-slate-50 border-slate-200" 
             />
          </div>
        </div>

      </aside>
    </div>
  )
}
