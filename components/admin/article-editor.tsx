'use client'

import { useState, useRef, useEffect } from 'react'
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
  Upload, X, Save, Send, Search, ChevronDown, 
  ChevronUp, User, PlusCircle, Layout, Settings, 
  Eye, Image as ImageIcon, Globe, Info, Wand2
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'
interface ArticleEditorProps {
  initialData?: {
    slug: string
    title: string
    content: string
    author: string
    category: string
    image_url: string | null
    read_time: string
    published: boolean
    meta_description?: string | null
    meta_keywords?: string | null
    focus_keyword?: string | null
    og_title?: string | null
    og_description?: string | null
    og_image?: string | null
    canonical_url?: string | null
    article_type?: string | null
    generation_status?: string | null
  }
  mode: 'create' | 'edit'
}

const categories = [
  'Smartphones', 'Laptops & PCs', 'Audio & Headphones', 
  'Home Appliances', 'Gaming', 'Cameras', 'Wearables', 
  'TVs & Displays', 'Price Comparison', 'Buying Guide', 
  'News', 'Deals'
]

interface Editor {
  id: string; slug: string; name: string; avatar_url: string | null; specialty: string | null;
}

export function ArticleEditor({ initialData, mode }: ArticleEditorProps) {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // State
  const [title, setTitle] = useState(initialData?.title || '')
  const [slug, setSlug] = useState(initialData?.slug || '')
  const [content, setContent] = useState(initialData?.content || '')
  const [author, setAuthor] = useState(initialData?.author || '')
  const [category, setCategory] = useState(initialData?.category || '')
  const [readTime, setReadTime] = useState(initialData?.read_time || '5 min read')
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || '')
  const [metaDescription, setMetaDescription] = useState(initialData?.meta_description || '')
  const [metaKeywords, setMetaKeywords] = useState(initialData?.meta_keywords || '')
  const [focusKeyword, setFocusKeyword] = useState(initialData?.focus_keyword || '')
  const [ogTitle, setOgTitle] = useState(initialData?.og_title || '')
  const [ogDescription, setOgDescription] = useState(initialData?.og_description || '')
  const [ogImage, setOgImage] = useState(initialData?.og_image || '')
  const [canonicalUrl, setCanonicalUrl] = useState(initialData?.canonical_url || '')
  const [articleType, setArticleType] = useState(initialData?.article_type || 'manual')
  const [generationStatus, setGenerationStatus] = useState(initialData?.generation_status || 'draft')
  
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [editors, setEditors] = useState<Editor[]>([])
  const [editorsLoading, setEditorsLoading] = useState(true)
  const [showProductModal, setShowProductModal] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [modalMode, setModalMode] = useState<'product' | 'embed'>('product')
  const [embedCode, setEmbedCode] = useState('')

  // Load Editors
  useEffect(() => {
    async function fetchEditors() {
      try {
        const res = await fetch('/api/writers')
        if (res.ok) {
          const data = await res.json()
          setEditors(data)
          if (mode === 'edit' && initialData?.author && !author) setAuthor(initialData.author)
        }
      } catch (e) { console.error('Failed to load editors', e) }
      finally { setEditorsLoading(false) }
    }
    fetchEditors()
  }, [])

  // Load Products for Inserter
  useEffect(() => {
    if (showProductModal) {
      async function fetchProducts() {
        try {
          const res = await fetch('/api/products')
          if (!res.ok) throw new Error('Failed to fetch products')
          const data = await res.json()
          setProducts(data || [])
        } catch (e) { console.error('Failed to load products for inserter', e) }
      }
      fetchProducts()
    }
  }, [showProductModal])

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
      const { error: uploadError } = await supabase.storage.from('article_images').upload(`articles/${fileName}`, file)
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('article_images').getPublicUrl(`articles/${fileName}`)
      setImageUrl(data.publicUrl)
      toast({ title: 'Image uploaded' })
    } catch (error: any) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' })
    } finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = '' }
  }

  const handleSave = async (publish: boolean = false) => {
    if (!title || !slug || !content || !author || !category) {
      toast({ title: 'Missing fields', description: 'Title, Slug, Content, Editor, and Category are required.', variant: 'destructive' })
      return
    }
    publish ? setPublishing(true) : setSaving(true)
    try {
      const articleData = {
        slug, title, content, author, category, 
        read_time: readTime, image_url: imageUrl || null, 
        published: publish, published_at: publish ? new Date().toISOString() : (initialData?.published ? null : null),
        meta_description: metaDescription || null, meta_keywords: metaKeywords || null,
        focus_keyword: focusKeyword || null, og_title: ogTitle || null,
        og_description: ogDescription || null, og_image: ogImage || null,
        canonical_url: canonicalUrl || null, article_type: articleType,
        generation_status: generationStatus,
      }
      const response = await fetch(mode === 'create' ? '/api/articles' : `/api/articles/${initialData?.slug}`, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleData),
      })
      if (!response.ok) throw new Error('Failed to save article')
      toast({ title: publish ? 'Article published!' : 'Article saved' })
      router.push('/admin/articles'); router.refresh()
    } catch (error: any) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' })
    } finally { setSaving(false); setPublishing(false) }
  }

  const insertProductCode = (productSlug: string) => {
    const shortcode = `\n\n[product-card:${productSlug}]\n\n`
    setContent(prev => prev + shortcode)
    setShowProductModal(false)
    toast({ title: 'Shortcode Inserted', description: `Added ${productSlug} to content.` })
  }

  const handleInsertEmbed = () => {
    if (!embedCode.trim()) return
    setContent(prev => prev + '\n\n' + embedCode + '\n\n')
    setEmbedCode('')
    setShowProductModal(false)
    toast({ title: 'Embed Code Inserted' })
  }

  return (
    <div className="cms-editor-layout">
      {/* ── Main content (Left) ─────────────────────────────────── */}
      <div className="space-y-6">
        {/* Title Identity Area */}
        <div className="space-y-4 mb-2">
          <div className="flex items-center gap-2 mb-1">
            <span className={initialData?.published ? 'status-published' : 'status-draft'}>
              {initialData?.published ? 'Published' : 'Draft'}
            </span>
            <span className={articleType === 'programmatic' ? 'status-generated' : 'text-[10px] font-bold text-slate-500 bg-slate-200 px-2.5 py-0.5 rounded-full uppercase tracking-widest'}>
              {articleType === 'programmatic' ? 'Programmatic' : 'Manual'}
            </span>
          </div>
          <Input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Endless Possibilities..."
            className="text-4xl font-black tracking-tight h-auto py-2 border-none bg-transparent focus-visible:ring-0 px-0 shadow-none placeholder:text-slate-200 text-slate-900"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          />
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-md py-1.5 px-3 w-max">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-sm text-slate-400 font-medium">comparemag.com/</span>
            <input 
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="text-sm font-bold text-blue-600 bg-transparent border-none p-0 focus:ring-0 min-w-[250px]"
              placeholder="article-slug"
            />
          </div>
        </div>

        {/* Content Editor area */}
        <div className="cms-sidebar-card overflow-visible shadow-none border-x-0 border-t-0 rounded-none bg-transparent mb-12">
          <div className="flex justify-end items-center py-2 mb-2">
             <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => setShowProductModal(true)}
                className="h-8 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 shadow-sm transition-colors"
              >
                <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
                Insert Block
              </Button>
          </div>
          <div className="relative border border-slate-200 rounded-2xl bg-white shadow-sm overflow-hidden focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100/50 transition-all">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your story..."
              className="min-h-[600px] border-none focus-visible:ring-0 rounded-none text-lg leading-relaxed pt-8 px-8 pb-14 resize-none placeholder:text-slate-300"
            />
            <div className="absolute bottom-0 w-full p-3 bg-slate-50 border-t border-slate-100 text-[11px] font-semibold text-slate-400 flex justify-between">
              <span>Rich HTML formatting supported</span>
              <span className="font-mono bg-slate-200/50 px-2 py-0.5 rounded text-slate-500">{content.length} characters</span>
            </div>
          </div>
        </div>

        {/* SEO Collapsible Section (Mobile/Small screen friendly) */}
        <div className="lg:hidden">
            {/* SEO controls would go here or stay in sidebar */}
        </div>
      </div>

      {/* ── Sidebar (Right) ───────────────────────────────────── */}
      <aside className="space-y-6 lg:sticky lg:top-24">
        
        {/* Publish Controls Card */}
        <div className="cms-sidebar-card">
          <div className="cms-sidebar-card-header">
            Publishing Controls
            <Settings className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="cms-sidebar-card-body space-y-3">
             <Button 
              onClick={() => handleSave(true)} 
              disabled={saving || publishing}
              className="w-full bg-blue-600 hover:bg-blue-700 h-10 font-bold shadow-sm"
            >
              <Send className="mr-2 h-4 w-4" />
              {publishing ? 'Publishing...' : initialData?.published ? 'Update Post' : 'Publish Post'}
            </Button>
            <Button
              variant="outline"
              className="w-full border-slate-200 h-10 font-semibold text-slate-600 hover:bg-slate-50"
              onClick={() => handleSave(false)}
              disabled={saving || publishing}
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save as Draft'}
            </Button>
          </div>
        </div>

        {/* Featured Image Card (Moved up for priority) */}
        <div className="cms-sidebar-card">
          <div className="cms-sidebar-card-header">
            Featured Image
            <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="cms-sidebar-card-body space-y-4">
             <div 
                className={`w-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center bg-slate-50 overflow-hidden group relative transition-all duration-200 ${!imageUrl ? 'aspect-[1.91/1] border-slate-300 hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer' : 'border-transparent shadow-sm'}`}
                onClick={() => !imageUrl && fileInputRef.current?.click()}
             >
                {imageUrl ? (
                  <>
                    <img src={imageUrl} className="w-full aspect-[1.91/1] object-cover" alt="Featured" />
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-3 transition-opacity duration-200 backdrop-blur-[2px]">
                      <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }} className="h-8 font-bold w-32 border-none">Replace Image</Button>
                      <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); setImageUrl('') }} className="h-8 font-bold w-32">Remove</Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6 flex flex-col items-center justify-center h-full">
                    <div className="w-10 h-10 bg-white rounded-full shadow-sm border border-slate-200 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:shadow-md transition-all">
                      <ImageIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-sm font-bold text-slate-800">Set featured image</p>
                    <p className="text-[11px] font-semibold text-slate-500 mt-1 max-w-[170px] leading-snug">Ideal size: 1200x630px <br/>(1.91:1 standard aspect ratio)</p>
                  </div>
                )}
             </div>
             <input ref={fileInputRef} type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
             <Input 
                value={imageUrl} 
                onChange={(e) => setImageUrl(e.target.value)} 
                placeholder="Or paste an exact URL..." 
                className="text-xs bg-slate-50 border-slate-200 h-9 font-mono"
             />
          </div>
        </div>

        {/* Author & Taxonomy Card */}
        <div className="cms-sidebar-card">
          <div className="cms-sidebar-card-header">
            Categorization
            <Info className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="cms-sidebar-card-body space-y-5">
            <div className="space-y-2">
              <Label className="text-[11px] text-slate-400 uppercase">Editor In Charge</Label>
              <Select value={author} onValueChange={setAuthor}>
                <SelectTrigger className="bg-slate-50 border-slate-200">
                  <SelectValue placeholder="Select editor" />
                </SelectTrigger>
                <SelectContent>
                  {editors.map((editor) => (
                    <SelectItem key={editor.id} value={editor.name}>
                      {editor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] text-slate-400 uppercase">Primary Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-slate-50 border-slate-200">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] text-slate-400 uppercase">Read Time Estimation</Label>
              <Input 
                value={readTime} 
                onChange={(e) => setReadTime(e.target.value)}
                className="bg-slate-50 border-slate-200"
              />
            </div>
          </div>
        </div>



        {/* SEO Settings Card */}
        <div className="cms-sidebar-card">
           <div className="cms-sidebar-card-header">
            Search Engine Optimization
            <Globe className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="cms-sidebar-card-body space-y-4">
             <div className="space-y-1.5">
               <Label className="text-xs text-slate-600">Focus Keyword</Label>
               <Input 
                value={focusKeyword} 
                onChange={(e) => setFocusKeyword(e.target.value)}
                placeholder="Main search term..."
                className="bg-slate-50 border-slate-200 text-sm"
               />
             </div>
             <div className="space-y-1.5">
               <Label className="text-xs text-slate-600">Meta Description</Label>
               <Textarea 
                value={metaDescription} 
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Search engine snippet..."
                className="bg-slate-50 border-slate-200 text-sm min-h-[100px] resize-none"
                maxLength={160}
               />
               <div className="text-[10px] text-right text-slate-400">{metaDescription.length}/160</div>
             </div>
             
             {/* Collapsible advanced SEO */}
             <div className="pt-2 border-t border-slate-100">
                <Button variant="ghost" size="sm" className="w-full text-xs text-blue-600 h-8">
                  Edit Advanced SEO (OG Tags)
                </Button>
             </div>
          </div>
        </div>

      </aside>

      {/* ── Product Selection Modal ───────────────────────────────── */}
      {showProductModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
               <div className="flex gap-4">
                 <button 
                  onClick={() => setModalMode('product')}
                  className={`text-sm font-bold pb-1 border-b-2 transition-all ${modalMode === 'product' ? 'text-blue-600 border-blue-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                 >
                   Products
                 </button>
                 <button 
                  onClick={() => setModalMode('embed')}
                  className={`text-sm font-bold pb-1 border-b-2 transition-all ${modalMode === 'embed' ? 'text-blue-600 border-blue-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                 >
                   Embed Code
                 </button>
               </div>
               <Button variant="ghost" size="icon" onClick={() => setShowProductModal(false)} className="rounded-full">
                 <X className="w-5 h-5" />
               </Button>
            </div>
            
            {modalMode === 'product' ? (
              <div className="p-6 max-h-[400px] overflow-y-auto space-y-3">
                {products.length === 0 ? (
                  <div className="text-center py-10 text-slate-400">Loading products...</div>
                ) : (
                  products.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                      <div className="min-w-0 pr-4">
                        <h4 className="text-sm font-bold text-slate-900 truncate">{p.title}</h4>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{p.slug}</p>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => insertProductCode(p.slug)}
                        className="bg-white text-slate-900 border-slate-200 hover:bg-blue-600 hover:text-white transition-colors"
                      >
                        Insert
                      </Button>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label>Embed Code (HTML)</Label>
                  <Textarea 
                    value={embedCode}
                    onChange={(e) => setEmbedCode(e.target.value)}
                    placeholder="Paste TikTok, YouTube, or Other HTML embed code here..."
                    className="min-h-[200px] font-mono text-sm leading-relaxed"
                  />
                  <p className="text-[10px] text-slate-400 italic">This will be injected exactly as provided into the article body.</p>
                </div>
                <Button 
                  onClick={handleInsertEmbed}
                  disabled={!embedCode.trim()}
                  className="w-full bg-blue-600"
                >
                  Insert Embed Code
                </Button>
              </div>
            )}
            
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
               <Button variant="ghost" onClick={() => setShowProductModal(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
