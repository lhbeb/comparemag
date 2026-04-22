'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Upload, Save, Send, ShoppingBag, 
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

type ProductField =
  | 'brand'
  | 'title'
  | 'slug'
  | 'shortDesc'
  | 'itemCondition'
  | 'priceText'
  | 'ratingText'
  | 'externalUrl'
  | 'ctaLabel'
  | 'badgeText'
  | 'imageUrl'
  | 'specs'

const ITEM_CONDITION_OPTIONS = [
  'Brand New',
  'New',
  'Mint',
  'Open Box',
  'Gently Used',
  'Fair',
] as const

const BADGE_LABEL_OPTIONS = [
  'Top Pick',
  'Premium Choice',
  'Preferred Choice',
  'Elite Choice',
  'Select Choice',
  'Best Value',
  'Smart Choice',
  'Our Pick',
  'Good Choice',
  'Recommended',
  'Prime Select',
  'Choice Select',
  'Top Select',
  'Choice Plus',
  'Editor’s Pick',
  'Value Choice',
  'Budget Pick',
  'Everyday Choice',
  'Essential Pick',
] as const

function normalizeExternalUrl(raw: string) {
  const trimmed = raw.trim()
  if (!trimmed) {
    throw new Error('Product link is required.')
  }
  if (/\s/.test(trimmed)) {
    throw new Error('Product link looks invalid. URLs cannot contain spaces.')
  }

  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  let parsed: URL
  try {
    parsed = new URL(candidate)
  } catch {
    throw new Error('Please enter a valid product URL.')
  }

  if (!parsed.hostname || !parsed.hostname.includes('.')) {
    throw new Error('Please enter a valid product URL.')
  }

  return parsed.toString()
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
  
  // Extract condition from specs if it exists
  const initialCondition = initialData?.specs?.condition || ''
  const [itemCondition, setItemCondition] = useState(initialCondition)
  
  // Exclude condition from the raw specs text editor
  const buildInitialSpecs = () => {
    if (!initialData?.specs) return ''
    const { condition, ...restSpecs } = initialData.specs
    if (Object.keys(restSpecs).length === 0) return ''
    return JSON.stringify(restSpecs, null, 2)
  }
  const [specs, setSpecs] = useState(buildInitialSpecs())
  
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [fetchingMetadataImage, setFetchingMetadataImage] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<ProductField, string>>>({})

  const generateSlug = (text: string) => text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')

  const fieldClassName = (field: ProductField, baseClassName: string) =>
    `${baseClassName} ${errors[field] ? 'border-red-300 bg-red-50/60 focus-visible:ring-red-200' : ''}`

  const setFieldError = (field: ProductField, message?: string) => {
    setErrors((current) => {
      if (!message) {
        const next = { ...current }
        delete next[field]
        return next
      }
      return { ...current, [field]: message }
    })
  }

  const validateField = (field: ProductField, value?: string) => {
    const normalizedValue = (value ?? '').trim()

    switch (field) {
      case 'brand':
        return normalizedValue ? '' : 'Brand is required.'
      case 'title':
        return normalizedValue ? '' : 'Product title is required.'
      case 'slug':
        return normalizedValue ? '' : 'Slug is required.'
      case 'shortDesc':
        return normalizedValue ? '' : 'Short note is required.'
      case 'itemCondition':
        return normalizedValue ? '' : 'Item condition is required.'
      case 'priceText':
        return normalizedValue ? '' : 'Price label is required.'
      case 'ratingText':
        return normalizedValue ? '' : 'Rating is required.'
      case 'externalUrl':
        if (!normalizedValue) return 'Affiliate link URL is required.'
        try {
          normalizeExternalUrl(normalizedValue)
          return ''
        } catch (error: any) {
          return error.message || 'Please enter a valid product URL.'
        }
      case 'ctaLabel':
        return normalizedValue ? '' : 'Button label is required.'
      case 'badgeText':
        return normalizedValue ? '' : 'Badge label is required.'
      case 'imageUrl':
        return normalizedValue ? '' : 'Product image is required.'
      case 'specs':
        if (!normalizedValue) return ''
        try {
          JSON.parse(normalizedValue)
          return ''
        } catch {
          return 'Specifications must be valid JSON.'
        }
    }
  }

  const validateForm = () => {
    const nextErrors: Partial<Record<ProductField, string>> = {}
    const fieldValues: Array<[ProductField, string]> = [
      ['brand', brand],
      ['title', title],
      ['slug', slug],
      ['shortDesc', shortDesc],
      ['itemCondition', itemCondition],
      ['priceText', priceText],
      ['ratingText', ratingText],
      ['externalUrl', externalUrl],
      ['ctaLabel', ctaLabel],
      ['badgeText', badgeText],
      ['imageUrl', imageUrl],
      ['specs', specs],
    ]

    for (const [field, value] of fieldValues) {
      const message = validateField(field, value)
      if (message) nextErrors[field] = message
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (mode === 'create' && !initialData?.slug) setSlug(generateSlug(value))
    if (errors.title) setFieldError('title', validateField('title', value) || undefined)
    if (mode === 'create' && !initialData?.slug && errors.slug) {
      setFieldError('slug', validateField('slug', generateSlug(value)) || undefined)
    }
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
      setFieldError('imageUrl')
      toast({ title: 'Image uploaded' })
    } catch (error: any) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' })
    } finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = '' }
  }

  const handleSave = async (publish: boolean = false) => {
    if (!validateForm()) {
      toast({ title: 'Missing required fields', description: 'Please fix the highlighted fields before saving.', variant: 'destructive' })
      return
    }

    let normalizedExternalUrl = ''
    try {
      normalizedExternalUrl = normalizeExternalUrl(externalUrl)
    } catch (error: any) {
      setFieldError('externalUrl', error.message || 'Please enter a valid product URL.')
      toast({ title: 'Invalid product link', description: error.message, variant: 'destructive' })
      return
    }

    let parsedSpecs: any = null
    if (specs) {
      try { parsedSpecs = JSON.parse(specs) } 
      catch (err) {
        setFieldError('specs', 'Specifications must be valid JSON.')
        toast({ title: 'Invalid specs JSON', variant: 'destructive' }); return
      }
    } else {
      parsedSpecs = {}
    }
    
    // Inject item condition into the specs JSONB
    if (itemCondition.trim()) {
      if (!parsedSpecs) parsedSpecs = {}
      parsedSpecs.condition = itemCondition.trim()
    }
    
    // If empty after stripping, set to null
    if (parsedSpecs && Object.keys(parsedSpecs).length === 0) {
      parsedSpecs = null
    }

    publish ? setPublishing(true) : setSaving(true)
    try {
      const payload = {
        slug, title, brand: brand || null, short_description: shortDesc,
        cta_label: ctaLabel || 'Check Price', external_url: normalizedExternalUrl,
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
      setExternalUrl(normalizedExternalUrl)
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
      const normalizedExternalUrl = normalizeExternalUrl(externalUrl)
      const response = await fetch('/api/products/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalizedExternalUrl }),
      })

      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(payload?.message || 'Could not pull preview image from product metadata.')
      }

      if (!payload?.image_url) {
        throw new Error('No metadata image was returned for this product URL.')
      }

      setImageUrl(payload.image_url)
      setFieldError('imageUrl')
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
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_290px]">
      <div className="space-y-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="mb-3 space-y-1.5">
            <div className="space-y-1.5">
              <Label className="text-[10px] text-slate-400 uppercase tracking-[0.2em]">Brand Name</Label>
              <div className="relative">
                <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={brand}
                  onChange={(e) => {
                    setBrand(e.target.value)
                    if (errors.brand) setFieldError('brand', validateField('brand', e.target.value) || undefined)
                  }}
                  onBlur={(e) => setFieldError('brand', validateField('brand', e.target.value) || undefined)}
                  placeholder="e.g. Sony"
                  className={fieldClassName('brand', 'h-9 rounded-xl border-slate-200 bg-slate-50 pl-10 text-sm font-semibold text-slate-700')}
                />
              </div>
            </div>
            {errors.brand ? <p className="text-xs text-red-600">{errors.brand}</p> : null}
            <div className="space-y-1.5">
              <Label className="text-[10px] text-slate-400 uppercase tracking-[0.2em]">Product Display Name</Label>
              <Input
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                onBlur={(e) => setFieldError('title', validateField('title', e.target.value) || undefined)}
                placeholder="Enter the full product name"
                className={fieldClassName('title', 'h-11 rounded-xl border-slate-200 bg-white px-4 text-lg font-bold text-slate-900 placeholder:text-slate-300')}
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              />
            </div>
            {errors.title ? <p className="text-xs text-red-600">{errors.title}</p> : null}
            <section className="space-y-1.5">
              <Label className="text-[10px] text-slate-400 uppercase tracking-[0.2em]">Internal ID (Slug)</Label>
              <p className="block min-w-0 truncate font-mono text-sm !text-slate-500">
                {slug || 'Will be generated from the product title'}
              </p>
            </section>
            {errors.slug ? <p className="text-xs text-red-600">{errors.slug}</p> : null}
          </div>

          <div className="space-y-3">
            <section className="space-y-2.5 rounded-2xl border border-slate-200 bg-slate-50/60 p-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Info className="w-4 h-4 text-slate-400" />
                Content Details
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Short Note</Label>
                <Textarea
                  value={shortDesc}
                  onChange={(e) => {
                    setShortDesc(e.target.value)
                    if (errors.shortDesc) setFieldError('shortDesc', validateField('shortDesc', e.target.value) || undefined)
                  }}
                  onBlur={(e) => setFieldError('shortDesc', validateField('shortDesc', e.target.value) || undefined)}
                  placeholder="A subtle note or short editorial aside that appears under the title..."
                  className={fieldClassName('shortDesc', 'min-h-[88px] bg-white border-slate-200 text-sm leading-relaxed text-slate-700 italic')}
                />
                {errors.shortDesc ? <p className="text-xs text-red-600">{errors.shortDesc}</p> : null}
                <p className="text-[10px] text-slate-400">Shown quietly on the product card and trimmed after 70 characters.</p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Item Condition</Label>
                <Select
                  value={itemCondition}
                  onValueChange={(value) => {
                    setItemCondition(value)
                    if (errors.itemCondition) setFieldError('itemCondition', validateField('itemCondition', value) || undefined)
                  }}
                >
                  <SelectTrigger className={fieldClassName('itemCondition', 'bg-white border-slate-200 text-sm')}>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {ITEM_CONDITION_OPTIONS.map((condition) => (
                      <SelectItem key={condition} value={condition}>
                        {condition}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.itemCondition ? <p className="text-xs text-red-600">{errors.itemCondition}</p> : null}
              </div>
            </section>

            <section className="space-y-2.5 rounded-2xl border border-slate-200 bg-white p-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <ExternalLink className="w-4 h-4 text-slate-400" />
                Price & Affiliate
              </div>
              <div className="space-y-2.5">
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-slate-400 uppercase">Price Label</Label>
                  <Input
                    value={priceText}
                    onChange={(e) => {
                      setPriceText(e.target.value)
                      if (errors.priceText) setFieldError('priceText', validateField('priceText', e.target.value) || undefined)
                    }}
                    onBlur={(e) => setFieldError('priceText', validateField('priceText', e.target.value) || undefined)}
                    placeholder="$299"
                    className={fieldClassName('priceText', 'bg-slate-50 border-slate-200 font-bold')}
                  />
                  {errors.priceText ? <p className="text-xs text-red-600">{errors.priceText}</p> : null}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] text-slate-400 uppercase">Rating</Label>
                  <div className="relative">
                    <Star className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                    <Input
                      value={ratingText}
                      onChange={(e) => {
                        setRatingText(e.target.value)
                        if (errors.ratingText) setFieldError('ratingText', validateField('ratingText', e.target.value) || undefined)
                      }}
                      onBlur={(e) => setFieldError('ratingText', validateField('ratingText', e.target.value) || undefined)}
                      placeholder="4.8/5"
                      className={fieldClassName('ratingText', 'pl-8 bg-slate-50 border-slate-200 font-bold')}
                    />
                  </div>
                  {errors.ratingText ? <p className="text-xs text-red-600">{errors.ratingText}</p> : null}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] text-slate-400 uppercase">Button Label</Label>
                  <Input
                    value={ctaLabel}
                    onChange={(e) => {
                      setCtaLabel(e.target.value)
                      if (errors.ctaLabel) setFieldError('ctaLabel', validateField('ctaLabel', e.target.value) || undefined)
                    }}
                    onBlur={(e) => setFieldError('ctaLabel', validateField('ctaLabel', e.target.value) || undefined)}
                    placeholder="Check Price"
                    className={fieldClassName('ctaLabel', 'bg-slate-50 border-slate-200 font-semibold')}
                  />
                  {errors.ctaLabel ? <p className="text-xs text-red-600">{errors.ctaLabel}</p> : null}
                </div>

             <div className="space-y-1.5">
                <Label className="text-[10px] text-slate-400 uppercase">Badge Label</Label>
                  <Select
                    value={badgeText}
                    onValueChange={(value) => {
                      setBadgeText(value)
                      if (errors.badgeText) setFieldError('badgeText', validateField('badgeText', value) || undefined)
                    }}
                  >
                    <SelectTrigger className={fieldClassName('badgeText', 'bg-orange-50 border-orange-100 text-orange-700 font-bold text-xs')}>
                      <SelectValue placeholder="Select badge label" />
                    </SelectTrigger>
                    <SelectContent>
                      {BADGE_LABEL_OPTIONS.map((badge) => (
                        <SelectItem key={badge} value={badge}>
                          {badge}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                {errors.badgeText ? <p className="text-xs text-red-600">{errors.badgeText}</p> : null}
             </div>
              </div>
            </section>

            <section className="space-y-2.5 rounded-2xl border border-slate-200 bg-white p-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Code className="w-4 h-4 text-slate-400" />
                Specifications
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Product Specifications (JSON)</Label>
                <div className="relative group">
                  <Textarea
                    value={specs}
                    onChange={(e) => {
                      setSpecs(e.target.value)
                      if (errors.specs) setFieldError('specs', validateField('specs', e.target.value) || undefined)
                    }}
                    onBlur={(e) => setFieldError('specs', validateField('specs', e.target.value) || undefined)}
                    placeholder='{ "Battery": "14h", "Weight": "2.4 lbs" }'
                    className={fieldClassName('specs', 'min-h-[132px] font-mono bg-slate-900 text-slate-200 border-none p-3 text-xs leading-relaxed selection:bg-slate-600/40')}
                  />
                  <div className="absolute right-3 bottom-3 opacity-40 group-hover:opacity-100 transition-opacity">
                    <Code className="w-4 h-4 text-slate-500" />
                  </div>
                </div>
                {errors.specs ? <p className="text-xs text-red-600">{errors.specs}</p> : null}
                <p className="text-[10px] text-slate-400">Optional. If used, it must be valid JSON for comparison engines.</p>
              </div>
            </section>
          </div>
        </div>
      </div>

      <aside className="space-y-3 lg:sticky lg:top-16 self-start">
        <div className="cms-sidebar-card">
          <div className="cms-sidebar-card-header">
            Management
            <Settings className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="cms-sidebar-card-body space-y-3">
             <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-500">Live Status:</span>
                <span className={initialData?.published ? 'status-published' : 'status-draft'}>
                    {initialData?.published ? 'Published' : 'Draft'}
                </span>
             </div>
             
             <div className="space-y-2 pt-1">
                <Button 
                    onClick={() => handleSave(true)} 
                    disabled={saving || publishing}
                    className="w-full bg-blue-600 hover:bg-blue-700 h-9 font-bold text-white"
                >
                    <Send className="mr-2 h-4 w-4" />
                    {publishing ? 'Updating...' : 'Publish Product'}
                </Button>
                <Button
                    variant="outline"
                    className="w-full border-slate-200 h-9 font-semibold"
                    onClick={() => handleSave(false)}
                    disabled={saving || publishing}
                >
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? 'Saving...' : 'Keep as Draft'}
                </Button>
             </div>
          </div>
        </div>

        <div className="cms-sidebar-card">
          <div className="cms-sidebar-card-header">
            Product Visual
            <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="cms-sidebar-card-body space-y-3">
            <div className="space-y-1.5">
              <Label className="text-[10px] text-slate-400 uppercase">Affiliate Link URL</Label>
              <Input
                value={externalUrl}
                onChange={(e) => {
                  setExternalUrl(e.target.value)
                  if (errors.externalUrl) setFieldError('externalUrl', validateField('externalUrl', e.target.value) || undefined)
                }}
                onBlur={(e) => setFieldError('externalUrl', validateField('externalUrl', e.target.value) || undefined)}
                placeholder="https://..."
                className={fieldClassName('externalUrl', 'bg-slate-50 border-slate-200 text-xs')}
              />
              {errors.externalUrl ? <p className="text-xs text-red-600">{errors.externalUrl}</p> : null}
            </div>
            <div
              className={`aspect-[16/10] w-full rounded-2xl border-2 border-dashed flex items-center justify-center bg-slate-50 overflow-hidden group cursor-pointer relative shadow-inner ${errors.imageUrl ? 'border-red-300 bg-red-50/40' : 'border-slate-200'}`}
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
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    {uploading ? 'Uploading...' : 'Add Photo'}
                  </p>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
            <Input
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value)
                if (errors.imageUrl) setFieldError('imageUrl', validateField('imageUrl', e.target.value) || undefined)
              }}
              onBlur={(e) => setFieldError('imageUrl', validateField('imageUrl', e.target.value) || undefined)}
              placeholder="Or paste external asset URL..."
              className={fieldClassName('imageUrl', 'text-[10px] bg-slate-50 border-slate-200')}
            />
            {errors.imageUrl ? <p className="text-xs text-red-600">{errors.imageUrl}</p> : null}
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
        </div>
      </aside>
    </div>
  )
}
