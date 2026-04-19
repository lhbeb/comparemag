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
  X, Save, Send,
  PlusCircle, Layout, Settings,
  Eye, Image as ImageIcon, Globe, Info, Wand2,
  Bold, Italic, Link as LinkIcon, Heading2, Heading3, Quote, Code, List,
  Search, Upload, ArrowUpRight
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs'
import { ArticleRenderer, compileArticleSourceToHtml } from '@/components/article-renderer'

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
    listed_by?: string | null
    published_at?: string | null
  }
  mode: 'create' | 'edit'
  initialWriters?: any[]
  initialProducts?: any[]
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

function truncateMiddle(value: string, max = 30) {
  if (!value || value.length <= max) return value
  const start = Math.ceil((max - 1) / 2)
  const end = Math.floor((max - 1) / 2)
  return `${value.slice(0, start)}…${value.slice(-end)}`
}

function extractCleanDomain(url: string | null | undefined): string | null {
  if (!url) return null

  const trimmed = url.trim()
  if (!trimmed || /\s/.test(trimmed)) return null

  try {
    const full = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`
    const hostname = new URL(full).hostname.replace(/^www\./, '').toLowerCase()
    if (!hostname || !hostname.includes('.')) return null
    return hostname
  } catch {
    return null
  }
}

export function ArticleEditor({ initialData, mode, initialWriters = [], initialProducts = [] }: ArticleEditorProps) {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const editorHtmlRef = useRef(initialData?.content || '')
  const productPreviewMap = Object.fromEntries(
    initialProducts.map((product: any) => [product.slug, product]),
  )

  // State
  const [title, setTitle] = useState(initialData?.title || '')
  const [slug, setSlug] = useState(initialData?.slug || '')
  const [content, setContent] = useState(initialData?.content || '')
  
  // Default to first writer and category if creating new to prevent validation blocks
  const [author, setAuthor] = useState(initialData?.author || (initialWriters.length > 0 ? initialWriters[0].name : ''))
  const [category, setCategory] = useState(initialData?.category || categories[0] || '')
  const [listedBy, setListedBy] = useState(initialData?.listed_by || '')
  
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
  
  // Use passed server-rendered data to prevent client waterfalls
  const editors = initialWriters;
  const products = initialProducts;
  
  const [showProductModal, setShowProductModal] = useState(false)
  const [modalMode, setModalMode] = useState<'product' | 'embed'>('product')
  const [embedCode, setEmbedCode] = useState('')
  const [activeTab, setActiveTab] = useState<'write' | 'seo' | 'preview' | 'html'>('write')
  const [productSearch, setProductSearch] = useState('')
  const [productDomainFilter, setProductDomainFilter] = useState<string | null>(null)
  const [loadedProductImages, setLoadedProductImages] = useState<Record<string, boolean>>({})

  // Automatically set author on mount if absent
  useEffect(() => {
    if (mode === 'edit' && initialData?.author && !author) {
      setAuthor(initialData.author)
    }
  }, [mode, initialData?.author, author])

  useEffect(() => {
    if (activeTab !== 'write' || !editorRef.current) return
    if (editorRef.current.innerHTML !== editorHtmlRef.current) {
      editorRef.current.innerHTML = editorHtmlRef.current
    }
  }, [activeTab])

  useEffect(() => {
    editorHtmlRef.current = content
    if (editorRef.current && activeTab === 'write' && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content
    }
  }, [content, activeTab])

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
      const { error: uploadError } = await supabase.storage.from('article_images').upload(`articles/${fileName}`, file, {
        cacheControl: '31536000',
        upsert: false,
      })
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('article_images').getPublicUrl(`articles/${fileName}`)
      setImageUrl(data.publicUrl)
      toast({ title: 'Image uploaded' })
    } catch (error: any) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' })
    } finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = '' }
  }

  const handleSave = async (publish: boolean = false) => {
    // ── Base validation (applies to both Save Draft & Publish) ──────────
    if (!title.trim()) {
      toast({ title: 'Missing title', description: 'Add an article title before saving.', variant: 'destructive' })
      return
    }
    if (!slug.trim()) {
      toast({ title: 'Missing slug', description: 'A URL slug is required.', variant: 'destructive' })
      return
    }
    if (!content.trim()) {
      toast({ title: 'No content', description: 'Write something in the workspace before saving.', variant: 'destructive' })
      return
    }

    // ── Publish-only strict gate ─────────────────────────────────────────
    if (publish) {
      if (!imageUrl.trim()) {
        toast({
          title: '🖼 Featured image required',
          description: 'Upload or paste a featured image URL in the sidebar before publishing.',
          variant: 'destructive',
        })
        return
      }
      if (!author.trim()) {
        toast({
          title: '✍️ Byline required',
          description: 'Choose an editor/author for this article before publishing.',
          variant: 'destructive',
        })
        return
      }
      if (!listedBy.trim()) {
        toast({
          title: '🆔 Who listed this?',
          description: 'Select your name in the "Listed By" field so we know who published this.',
          variant: 'destructive',
        })
        return
      }
      if (!category.trim()) {
        toast({
          title: '📂 Category required',
          description: 'Choose a category before publishing.',
          variant: 'destructive',
        })
        return
      }
    }

    publish ? setPublishing(true) : setSaving(true)
    try {
      // ── Auto-derive SEO fields from article content when left blank ──────
      const plainText = content
        .replace(/<[^>]+>/g, ' ')           // strip HTML tags
        .replace(/\s+/g, ' ')               // collapse whitespace
        .trim()

      const derivedMetaDescription = metaDescription.trim()
        || plainText.substring(0, 155).trimEnd() + (plainText.length > 155 ? '…' : '')

      const derivedOgTitle = ogTitle.trim() || title.trim()

      const derivedOgDescription = ogDescription.trim()
        || derivedMetaDescription

      const derivedOgImage = ogImage.trim() || imageUrl.trim() || ''

      // Extract sensible keywords from title and category instead of random content words
      const derivedFocusKeyword = focusKeyword.trim() || category.trim()
      const titleWords = title.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 3)
      const derivedMetaKeywords = metaKeywords.trim() || 
        [category.toLowerCase(), ...titleWords].slice(0, 8).join(', ')

      const payload = {
        slug, title, content, author, category,
        image_url: imageUrl || null, read_time: readTime,
        published: publish, published_at: publish ? (initialData?.published_at || new Date().toISOString()) : null,
        article_type: articleType, generation_status: publish ? 'published' : generationStatus,
        meta_description: derivedMetaDescription || null,
        meta_keywords: derivedMetaKeywords || null,
        focus_keyword: derivedFocusKeyword || null,
        og_title: derivedOgTitle || null,
        og_description: derivedOgDescription || null,
        og_image: derivedOgImage || null,
        canonical_url: canonicalUrl || null,
        listed_by: listedBy || null,
      }
      const response = await fetch(mode === 'create' ? '/api/articles' : `/api/articles/${initialData?.slug}`, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        let message = 'Failed to save article'
        try {
          const errorBody = await response.json()
          if (typeof errorBody?.message === 'string' && errorBody.message.trim()) {
            message = errorBody.message
          }
        } catch {
          // Ignore JSON parse failures and keep fallback message
        }
        throw new Error(message)
      }
      toast({ title: publish ? 'Article published! 🚀' : 'Draft saved ✓' })
      router.push('/admin/articles'); router.refresh()
    } catch (error: any) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' })
    } finally { setSaving(false); setPublishing(false) }
  }

  // --- WYSIWYG Editor Helpers (execCommand-based) ---
  const exec = (command: string, value?: string) => {
    editorRef.current?.focus()
    document.execCommand(command, false, value)
    syncEditorContent()
  }

  const syncEditorContent = () => {
    if (editorRef.current) {
      const nextContent = editorRef.current.innerHTML
      editorHtmlRef.current = nextContent
      setContent(nextContent)
    }
  }

  const handleTabChange = (value: string) => {
    if (activeTab === 'write') {
      syncEditorContent()
    }
    setActiveTab(value as typeof activeTab)
  }

  const handleInsertLink = () => {
    const url = window.prompt('Enter link URL:')
    if (url) exec('createLink', url)
  }

  const insertProductCode = (productSlug: string) => {
    if (!editorRef.current) return
    editorRef.current.focus()
    const shortcode = `[product-card:${productSlug}]`
    document.execCommand('insertHTML', false, `<p>${shortcode}</p>`)
    syncEditorContent()
    setShowProductModal(false)
    setActiveTab('preview')
    toast({ title: 'Product Inserted', description: `Shortcode embedded in article.` })
  }

  const handleInsertEmbed = () => {
    if (!embedCode.trim() || !editorRef.current) return
    editorRef.current.focus()
    document.execCommand('insertHTML', false, embedCode)
    syncEditorContent()
    setEmbedCode('')
    setShowProductModal(false)
    toast({ title: 'Embed Code Inserted' })
  }

  const compiledHtml = compileArticleSourceToHtml(content)

  return (
    <div className="relative pb-24">
      {/* ── Fixed Bottom Action Bar ───────────────────────────────── */}
      <div className="fixed bottom-0 right-0 left-0 lg:left-60 bg-white/80 backdrop-blur-md border-t border-slate-200 p-4 px-8 z-40 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-3">
          <span className={initialData?.published ? 'status-published' : 'status-draft'}>
            {initialData?.published ? 'Live' : 'Draft'}
          </span>
          <span className="text-xs font-medium text-slate-400">
            {content.length > 0 ? `${content.split(/\s+/).length} words` : '0 words'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 min-w-[120px]"
            onClick={() => handleSave(false)}
            disabled={saving || publishing}
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button 
            onClick={() => handleSave(true)} 
            disabled={saving || publishing}
            className="bg-blue-600 hover:bg-blue-700 font-bold min-w-[140px] shadow-md shadow-blue-500/20 text-white"
          >
            <Send className="mr-2 h-4 w-4" />
            {publishing ? 'Publishing...' : initialData?.published ? 'Update Live' : 'Publish'}
          </Button>
        </div>
      </div>

      <div className="cms-editor-layout">
        {/* ── Main content (Left) ─────────────────────────────────── */}
        <div className="space-y-8">
          
          {/* Identity Header */}
          <div className="space-y-4">
            {articleType === 'programmatic' && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-start gap-3">
                <Wand2 className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-bold text-purple-900 text-sm">Programmatic Article</h4>
                  <p className="text-xs text-purple-700 mt-1">This article is tied to an automated generation pipeline. Manual edits to the body may be overwritten if you re-run the programmatic bulk generator.</p>
                </div>
              </div>
            )}
            
            <Input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Article Title..."
              className="text-4xl lg:text-5xl font-black tracking-tight h-auto py-2 border-none bg-transparent focus-visible:ring-0 px-0 shadow-none placeholder:text-slate-200 text-slate-900"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.03em' }}
            />
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-md py-1.5 px-3 w-max max-w-full overflow-hidden">
              <Globe className="w-4 h-4 flex-shrink-0 text-slate-400" />
              <span className="text-sm text-slate-400 font-medium hidden sm:inline">comparemag.com/blog/</span>
              <input 
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="text-sm font-bold text-blue-600 bg-transparent border-none p-0 focus:ring-0 w-full sm:min-w-[200px]"
                placeholder="article-slug"
              />
            </div>
            <div className="flex items-center gap-3">
              {mode === 'edit' && slug ? (
                <Link
                  href={`/blog/${slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-700 transition-colors"
                >
                  View Article
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-400">
                  Save article to enable live link
                </div>
              )}
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-lg w-max mb-6 border border-slate-200/50">
              <TabsTrigger value="write" className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold text-slate-600 rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm transition-all focus-visible:outline-none">
                <Layout className="w-4 h-4" /> Write Workspace
              </TabsTrigger>
              <TabsTrigger value="seo" className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold text-slate-600 rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm transition-all focus-visible:outline-none">
                <Search className="w-4 h-4" /> SEO & Search
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold text-slate-600 rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm transition-all focus-visible:outline-none">
                <Eye className="w-4 h-4" /> Preview
              </TabsTrigger>
              <TabsTrigger value="html" className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold text-slate-600 rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm transition-all focus-visible:outline-none">
                <Code className="w-4 h-4" /> HTML Output
              </TabsTrigger>
            </TabsList>

            {/* TAB: WRITE */}
            <TabsContent value="write" forceMount className="mt-0 outline-none data-[state=inactive]:hidden">
              <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden flex flex-col transition-colors focus-within:border-blue-300" style={{ minHeight: '800px' }}>
                
                {/* WYSIWYG Toolbar */}
                <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-100 bg-slate-50/70 flex-shrink-0 sticky top-0 z-10">
                  <div className="flex items-center gap-1 pr-2 border-r border-slate-200">
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:text-slate-900" onMouseDown={(e) => { e.preventDefault(); exec('bold') }} title="Bold (Ctrl+B)">
                      <Bold className="w-4 h-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:text-slate-900" onMouseDown={(e) => { e.preventDefault(); exec('italic') }} title="Italic (Ctrl+I)">
                      <Italic className="w-4 h-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:text-slate-900" onMouseDown={(e) => { e.preventDefault(); handleInsertLink() }} title="Insert Link">
                      <LinkIcon className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-1 pl-1 pr-2 border-r border-slate-200">
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:text-slate-900" onMouseDown={(e) => { e.preventDefault(); exec('formatBlock', 'h2') }} title="Heading 2">
                      <Heading2 className="w-4 h-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:text-slate-900" onMouseDown={(e) => { e.preventDefault(); exec('formatBlock', 'h3') }} title="Heading 3">
                      <Heading3 className="w-4 h-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:text-slate-900" onMouseDown={(e) => { e.preventDefault(); exec('formatBlock', 'blockquote') }} title="Blockquote">
                      <Quote className="w-4 h-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:text-slate-900" onMouseDown={(e) => { e.preventDefault(); exec('insertUnorderedList') }} title="Bullet List">
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center pl-2">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => { setProductSearch(''); setShowProductModal(true) }}
                      className="h-8 text-xs font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                    >
                      <PlusCircle className="h-4 w-4 mr-1.5" />
                      Insert Product / Embed
                    </Button>
                  </div>
                </div>

                {/* WYSIWYG Editable Body */}
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={syncEditorContent}
                  onBlur={syncEditorContent}
                  data-placeholder="Start writing your article here..."
                  className="flex-1 w-full px-10 py-8 text-base leading-relaxed text-slate-800 outline-none overflow-y-auto
                    prose prose-slate max-w-full
                    prose-h2:text-2xl prose-h2:font-bold prose-h2:text-slate-900 prose-h2:mt-8 prose-h2:mb-3
                    prose-h3:text-xl prose-h3:font-semibold prose-h3:text-slate-800 prose-h3:mt-6 prose-h3:mb-2
                    prose-p:text-slate-700 prose-p:leading-relaxed prose-p:my-3
                    prose-strong:text-slate-900 prose-strong:font-bold
                    prose-em:italic prose-em:text-slate-700
                    prose-a:text-blue-600 prose-a:underline
                    prose-blockquote:border-l-4 prose-blockquote:border-blue-300 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-slate-600
                    prose-ul:list-disc prose-ul:pl-6
                    prose-ol:list-decimal prose-ol:pl-6
                    prose-img:rounded-xl prose-img:shadow-md
                    empty:before:content-[attr(data-placeholder)] empty:before:text-slate-300 empty:before:italic empty:before:pointer-events-none"
                  style={{ minHeight: '720px' }}
                />

                <div className="flex-shrink-0 border-t border-slate-100 bg-slate-50/60 px-6 py-2.5 text-xs text-slate-400 flex items-center justify-between">
                  <span>WYSIWYG editor · Formatting applied directly · Product cards saved as shortcodes</span>
                  <span className="font-semibold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide bg-blue-50 text-blue-600">● Live</span>
                </div>
              </div>
            </TabsContent>

            {/* TAB: SEO & SEARCH */}
            <TabsContent value="seo" forceMount className="mt-0 outline-none space-y-8 data-[state=inactive]:hidden">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Search className="w-5 h-5 text-blue-600" /> Standard SEO
                </h3>
                
                <div className="grid gap-6">
                  {/* Google SERP Snippet Preview */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Snippet Preview</h4>
                    <div className="font-sans max-w-[600px] bg-white p-4 rounded shadow-sm border border-slate-100">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                           <Globe className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-[#202124]">CompareMag</span>
                          <span className="text-xs text-[#4d5156]">comparemag.com › blog › {slug || 'article-slug'}</span>
                        </div>
                      </div>
                      <h3 className="text-[20px] text-[#1a0dab] group-hover:underline cursor-pointer leading-tight mb-1" style={{ fontFamily: 'arial, sans-serif' }}>
                        {ogTitle || title || 'Untitled Article'}
                      </h3>
                      <p className="text-sm text-[#4d5156] leading-snug line-clamp-2" style={{ fontFamily: 'arial, sans-serif' }}>
                        {metaDescription ? metaDescription.slice(0, 160) : 'Add a meta description to see how your article will look in Google search results. This text is crucial for optimizing your click-through rate.'}
                        {metaDescription && metaDescription.length > 160 ? '...' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">Focus Keyword</Label>
                      <Input 
                        value={focusKeyword} 
                        onChange={(e) => setFocusKeyword(e.target.value)}
                        placeholder="e.g., best budget smartphones"
                        className="max-w-md"
                      />
                      <p className="text-xs text-slate-500">The primary search term you want to rank for.</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-end">
                        <Label className="font-bold text-slate-700">Meta Description</Label>
                        <span className={`text-xs font-bold ${metaDescription.length > 160 ? 'text-red-500' : 'text-slate-400'}`}>
                          {metaDescription.length} / 160
                        </span>
                      </div>
                      <Textarea 
                        value={metaDescription} 
                        onChange={(e) => setMetaDescription(e.target.value)}
                        placeholder="A compelling summary of the article..."
                        className="h-24 resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced SEO */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-purple-600" /> Advanced Metadata (Open Graph)
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">OG Title</Label>
                      <Input value={ogTitle} onChange={(e) => setOgTitle(e.target.value)} placeholder="Title for Facebook/Twitter..." />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">OG Description</Label>
                      <Textarea value={ogDescription} onChange={(e) => setOgDescription(e.target.value)} placeholder="Description for social cards..." className="h-20 resize-none" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">OG Image URL</Label>
                      <Input value={ogImage} onChange={(e) => setOgImage(e.target.value)} placeholder="https://..." />
                      <p className="text-xs text-slate-500">Leave blank to fallback to Featured Image.</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">Canonical URL</Label>
                      <Input value={canonicalUrl} onChange={(e) => setCanonicalUrl(e.target.value)} placeholder="https://..." />
                      <p className="text-xs text-slate-500">Only if this article was originally published elsewhere.</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB: PREVIEW */}
            <TabsContent value="preview" forceMount className="mt-0 outline-none data-[state=inactive]:hidden">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 md:p-12 min-h-[700px]">
                <h1 className="text-4xl font-bold mb-8 text-slate-900">{title || 'Untitled Article'}</h1>
                <div className="prose prose-lg prose-slate max-w-none prose-a:text-blue-600 hover:prose-a:text-blue-800 prose-headings:text-slate-900 prose-img:rounded-xl">
                  <ArticleRenderer source={content} preloadedProducts={productPreviewMap} />
                </div>
              </div>
            </TabsContent>

            {/* TAB: HTML OUTPUT */}
            <TabsContent value="html" forceMount className="mt-0 outline-none data-[state=inactive]:hidden">
              <div className="bg-slate-900 rounded-xl shadow-inner p-6 min-h-[700px] font-mono text-sm text-green-400 overflow-x-auto whitespace-pre-wrap">
                {compiledHtml || '<!-- No content yet -->'}
              </div>
            </TabsContent>
          </Tabs>

        </div>

        {/* ── Sidebar (Right) ───────────────────────────────────── */}
        <aside className="space-y-6 lg:sticky lg:top-24 h-max">
          
          {/* Featured Image Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 font-bold text-sm text-slate-900 flex items-center justify-between">
              Featured Image
              <ImageIcon className="w-4 h-4 text-slate-400" />
            </div>
            <div className="p-5 space-y-4">
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
                        <Upload className="w-4 h-4 text-blue-600" />
                      </div>
                      <p className="text-sm font-bold text-slate-800">Upload cover image</p>
                      <p className="text-[11px] font-semibold text-slate-500 mt-1">Recommended: 1200x630px</p>
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

          {/* Configuration Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 font-bold text-sm text-slate-900 flex items-center justify-between">
              Configuration
              <Settings className="w-4 h-4 text-slate-400" />
            </div>
            <div className="p-5 space-y-5">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700">Editor / Byline</Label>
                <Select value={author} onValueChange={setAuthor}>
                  <SelectTrigger className="bg-slate-50/50 border-slate-200">
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

              <div className="space-y-2 relative pb-2 mb-2 border-b border-indigo-50 border-dashed">
                <Label className="text-xs font-bold text-indigo-700 flex items-center justify-between">
                  <span>Internal Tracking</span>
                  <span className="text-[9px] uppercase tracking-widest text-indigo-400 bg-indigo-50 px-1.5 py-0.5 rounded">Admin Only</span>
                </Label>
                <Select value={listedBy} onValueChange={setListedBy}>
                  <SelectTrigger className="bg-indigo-50/30 border-indigo-100 text-indigo-900 h-9">
                    <SelectValue placeholder="Listed By..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="walid">Walid</SelectItem>
                    <SelectItem value="yassine">Yassine</SelectItem>
                    <SelectItem value="jebbar">Jebbar</SelectItem>
                    <SelectItem value="janah">Janah</SelectItem>
                    <SelectItem value="amine">Amine</SelectItem>
                    <SelectItem value="abdo">Abdo</SelectItem>
                    <SelectItem value="mehdi">Mehdi</SelectItem>
                    <SelectItem value="othmane">Othmane</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-slate-400">Used for staff payout and tracking metrics. Does not appear on live site.</p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700">Primary Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="bg-slate-50/50 border-slate-200">
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
                <Label className="text-xs font-bold text-slate-700">Read Time Estimation</Label>
                <Input 
                  value={readTime} 
                  onChange={(e) => setReadTime(e.target.value)}
                  className="bg-slate-50/50 border-slate-200 text-sm"
                />
              </div>
            </div>
          </div>

        </aside>

      </div>

      {/* ── Product Selection Modal ───────────────────────────────── */}
      {showProductModal && (() => {
        // Derive unique domains from all products' external_url
        const allDomains = Array.from(
          new Set(products.map(p => extractCleanDomain(p.external_url)).filter(Boolean))
        ).sort() as string[]

        return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
               <div className="flex gap-6">
                 <button 
                   onClick={() => { setModalMode('product'); setProductSearch(''); setProductDomainFilter(null) }}
                  className={`text-sm font-bold pb-1 border-b-2 transition-all ${modalMode === 'product' ? 'text-blue-600 border-blue-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                 >
                   Insert Product Block
                 </button>
                 <button 
                  onClick={() => setModalMode('embed')}
                  className={`text-sm font-bold pb-1 border-b-2 transition-all ${modalMode === 'embed' ? 'text-blue-600 border-blue-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                 >
                   Raw Embed Code
                 </button>
               </div>
               <Button variant="ghost" size="icon" onClick={() => { setShowProductModal(false); setProductSearch(''); setProductDomainFilter(null) }} className="rounded-full h-8 w-8 hover:bg-slate-200">
                 <X className="w-4 h-4 text-slate-500" />
               </Button>
            </div>
            
            {modalMode === 'product' ? (
              <div className="flex flex-col bg-white">
                {/* ── Search bar ── */}
                <div className="px-6 pt-4 pb-3 border-b border-slate-100 space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      autoFocus
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search by title, brand, slug, or store…"
                      className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"
                    />
                    {productSearch && (
                      <button
                        onClick={() => setProductSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* ── Domain filter pills ── */}
                  {allDomains.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => setProductDomainFilter(null)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all border ${
                          productDomainFilter === null
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                        }`}
                      >
                        All
                      </button>
                      {allDomains.map(domain => (
                        <button
                          key={domain}
                          onClick={() => setProductDomainFilter(productDomainFilter === domain ? null : domain)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all border ${
                            productDomainFilter === domain
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                              : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                          }`}
                        >
                          {domain}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── Filtered list ── */}
                <div className="overflow-y-auto max-h-[340px] p-4 space-y-1.5">
                  {(() => {
                    const query = productSearch.toLowerCase().trim()
                    let filtered = products

                    // Apply domain filter
                    if (productDomainFilter) {
                      filtered = filtered.filter(p => extractCleanDomain(p.external_url) === productDomainFilter)
                    }

                    // Apply text search
                    if (query) {
                      filtered = filtered.filter(p => {
                        const domain = extractCleanDomain(p.external_url)
                        return (
                          p.title?.toLowerCase().includes(query) ||
                          p.slug?.toLowerCase().includes(query) ||
                          p.brand?.toLowerCase().includes(query) ||
                          domain?.toLowerCase().includes(query)
                        )
                      })
                    }

                    if (products.length === 0) {
                      return <div className="text-center py-10 text-slate-400 text-sm">No products in database yet.</div>
                    }
                    if (filtered.length === 0) {
                      return (
                        <div className="text-center py-10">
                          <Search className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                          <p className="text-sm font-semibold text-slate-500">
                            {productDomainFilter && !query
                              ? <>No products from <span className="font-mono">{productDomainFilter}</span></>
                              : <>No products match &ldquo;{productSearch}&rdquo;{productDomainFilter ? <> on <span className="font-mono">{productDomainFilter}</span></> : null}</>}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">Try a different search or clear the domain filter</p>
                        </div>
                      )
                    }
                    return (
                      <>
                        {(query || productDomainFilter) && (
                          <p className="text-[11px] text-slate-400 px-1 pb-1">
                            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                            {productDomainFilter ? <> · <span className="font-mono">{productDomainFilter}</span></> : null}
                            {query ? <> · &ldquo;{productSearch}&rdquo;</> : null}
                          </p>
                        )}
                        {filtered.map(p => {
                          const domain = extractCleanDomain(p.external_url)
                          return (
                            <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group">
                              {/* Thumbnail */}
                              <div className="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                                {!loadedProductImages[p.slug] && p.image_url ? (
                                  <div className="absolute inset-0 animate-pulse bg-slate-200" />
                                ) : null}
                                {p.image_url ? (
                                  <img
                                    src={p.image_url}
                                    alt={p.title}
                                    loading="lazy"
                                    onLoad={() => setLoadedProductImages((prev) => ({ ...prev, [p.slug]: true }))}
                                    onError={() => setLoadedProductImages((prev) => ({ ...prev, [p.slug]: true }))}
                                    className={`w-full h-full object-cover transition-opacity duration-300 ${loadedProductImages[p.slug] ? 'opacity-100' : 'opacity-0'}`}
                                  />
                                ) : (
                                  <ImageIcon className="w-5 h-5 text-slate-300" />
                                )}
                              </div>

                              {/* Title & Organization */}
                              <div className="min-w-0 flex-1 pr-4">
                                <h4 className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug" title={p.title}>{p.title}</h4>
                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                  {p.brand ? (
                                    <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200" title={p.brand}>
                                      {p.brand}
                                    </span>
                                  ) : null}
                                  {domain && (
                                    <span className="text-[10px] font-semibold text-blue-600 bg-blue-50/50 px-1.5 py-0.5 rounded border border-blue-100/50 truncate max-w-[100px]" title={domain}>{domain}</span>
                                  )}
                                  <p className="text-[10px] text-slate-500 font-mono truncate max-w-[150px] sm:max-w-[220px] bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100" title={p.slug}>
                                    {truncateMiddle(p.slug)}
                                  </p>
                                </div>
                              </div>
                              
                              <Button
                                size="sm"
                                onClick={() => insertProductCode(p.slug)}
                                className="flex-shrink-0 bg-white text-slate-700 font-semibold border border-slate-200 shadow-sm hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors"
                              >
                                Insert
                              </Button>
                            </div>
                          )
                        })}
                      </>
                    )
                  })()}
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-4 bg-white">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">Paste HTML Embed Code</Label>
                  <Textarea 
                    value={embedCode}
                    onChange={(e) => setEmbedCode(e.target.value)}
                    placeholder="<iframe src='...' />"
                    className="min-h-[250px] font-mono text-sm leading-relaxed bg-slate-50 border-slate-200"
                  />
                  <p className="text-xs text-slate-500 mt-2">This HTML will be injected directly into the article body exactly as provided.</p>
                </div>
                <Button 
                  onClick={handleInsertEmbed}
                  disabled={!embedCode.trim()}
                  className="w-full bg-blue-600 font-bold h-10 text-white"
                >
                  Confirm Insert
                </Button>
              </div>
            )}
          </div>
        </div>
        )
      })()} 
    </div>
  )
}
