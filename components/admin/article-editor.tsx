'use client'

import { useState, useRef, useEffect, useDeferredValue } from 'react'
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
  X, Save, Send, ChevronDown, 
  ChevronUp, User, PlusCircle, Layout, Settings, 
  Eye, Image as ImageIcon, Globe, Info, Wand2,
  Bold, Italic, Link as LinkIcon, Heading2, Heading3, Quote, Code, List,
  Search, Upload
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

export function ArticleEditor({ initialData, mode, initialWriters = [], initialProducts = [] }: ArticleEditorProps) {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const contentRef = useRef<HTMLTextAreaElement>(null)
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
  const [writeMode, setWriteMode] = useState<'source' | 'rendered'>('source')

  // Automatically set author on mount if absent
  useEffect(() => {
    if (mode === 'edit' && initialData?.author && !author) {
      setAuthor(initialData.author)
    }
  }, [mode, initialData?.author, author])

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
      const payload = {
        slug, title, content, author, category,
        image_url: imageUrl || null, read_time: readTime,
        published: publish, published_at: publish ? (initialData?.published_at || new Date().toISOString()) : null,
        article_type: articleType, generation_status: publish ? 'published' : generationStatus,
        meta_description: metaDescription || null,
        meta_keywords: metaKeywords || null,
        focus_keyword: focusKeyword || null,
        og_title: ogTitle || null,
        og_description: ogDescription || null,
        og_image: ogImage || null,
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
      toast({ title: publish ? 'Article published!' : 'Article saved' })
      router.push('/admin/articles'); router.refresh()
    } catch (error: any) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' })
    } finally { setSaving(false); setPublishing(false) }
  }

  // --- HTML Formatting Helpers ---
  const insertFormatting = (before: string, after: string, defaultText: string = '') => {
    const textarea = contentRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    const textToWrap = selectedText || defaultText
    
    const newContent = content.substring(0, start) + before + textToWrap + after + content.substring(end)
    setContent(newContent)
    
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, start + before.length + textToWrap.length)
    }, 0)
  }

  const handleInsertLink = () => {
    const url = window.prompt('Enter link URL:')
    if (url) {
      insertFormatting('[', `](${url})`, 'link text')
    }
  }

  const insertProductCode = (productSlug: string) => {
    const shortcode = `\n\n[product-card:${productSlug}]\n\n`
    insertFormatting(shortcode, '')
    setShowProductModal(false)
    setActiveTab('preview')
    toast({ title: 'Product Inserted', description: `Added ${productSlug} to content and opened preview.` })
  }

  const handleInsertEmbed = () => {
    if (!embedCode.trim()) return
    insertFormatting(`\n\n${embedCode}\n\n`, '')
    setEmbedCode('')
    setShowProductModal(false)
    setActiveTab('preview')
    toast({ title: 'Embed Code Inserted', description: 'Opened preview so you can verify the rendered block.' })
  }

  // Prevent Regex computation from blocking the main typing thread
  const deferredContent = useDeferredValue(content)
  const compiledHtml = compileArticleSourceToHtml(deferredContent)

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
          </div>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="w-full">
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
            <TabsContent value="write" className="mt-0 outline-none">
              <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden flex flex-col focus-within:border-blue-400 transition-colors" style={{ height: '800px' }}>
                
                {/* Unified Toolbar */}
                <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
                  {/* Formatting buttons — only shown in source mode */}
                  {writeMode === 'source' && (
                    <>
                      <div className="flex items-center gap-1 pr-2 border-r border-slate-200">
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:text-slate-900" onClick={() => insertFormatting('**', '**')} title="Bold">
                          <Bold className="w-4 h-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:text-slate-900" onClick={() => insertFormatting('*', '*')} title="Italic">
                          <Italic className="w-4 h-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:text-slate-900" onClick={handleInsertLink} title="Insert Link">
                          <LinkIcon className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-1 pl-1 pr-2 border-r border-slate-200">
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:text-slate-900" onClick={() => insertFormatting('## ', '')} title="Heading 2">
                          <Heading2 className="w-4 h-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:text-slate-900" onClick={() => insertFormatting('### ', '')} title="Heading 3">
                          <Heading3 className="w-4 h-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:text-slate-900" onClick={() => insertFormatting('> ', '')} title="Blockquote">
                          <Quote className="w-4 h-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:text-slate-900" onClick={() => insertFormatting('- ', '')} title="Bullet List">
                          <List className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex items-center pl-2 border-r border-slate-200 pr-2">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setShowProductModal(true)}
                          className="h-8 text-xs font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        >
                          <PlusCircle className="h-4 w-4 mr-1.5" />
                          Insert Product / Embed
                        </Button>
                      </div>
                    </>
                  )}

                  {/* Source / Rendered toggle — always visible, pushed to the right */}
                  <div className="flex items-center gap-0.5 ml-auto bg-slate-100 rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => setWriteMode('source')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${writeMode === 'source' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <Code className="w-3.5 h-3.5" />
                      Source
                    </button>
                    <button
                      type="button"
                      onClick={() => setWriteMode('rendered')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${writeMode === 'rendered' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Rendered
                    </button>
                  </div>
                </div>

                {/* Content area — swaps between textarea and live render */}
                {writeMode === 'source' ? (
                  <Textarea
                    ref={contentRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Draft your content in Markdown here... Legacy HTML will also render safely."
                    className="flex-1 w-full border-none focus-visible:ring-0 rounded-none text-base leading-loose px-8 py-6 resize-none placeholder:text-slate-300 font-mono"
                  />
                ) : (
                  <div className="flex-1 overflow-y-auto px-8 py-8 bg-white">
                    {deferredContent ? (
                      <div className="prose prose-slate max-w-full prose-headings:font-display prose-a:text-blue-600 prose-img:rounded-xl">
                        <ArticleRenderer source={deferredContent} preloadedProducts={productPreviewMap} />
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4">
                        <Eye className="w-10 h-10" />
                        <p className="italic text-sm">Start writing to see the live render here...</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex-shrink-0 border-t border-slate-100 bg-slate-50/60 px-6 py-2.5 text-xs text-slate-400 flex items-center justify-between">
                  <span>{writeMode === 'source' ? 'Markdown supported · Use toolbar to format' : 'Live rendered output — switch to Source to edit'}</span>
                  <span className={`font-semibold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide ${writeMode === 'rendered' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                    {writeMode === 'rendered' ? '● Live' : 'Source'}
                  </span>
                </div>
              </div>
            </TabsContent>

            {/* TAB: SEO & SEARCH */}
            <TabsContent value="seo" className="mt-0 outline-none space-y-8">
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
            <TabsContent value="preview" className="mt-0 outline-none">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 md:p-12 min-h-[700px]">
                <h1 className="text-4xl font-bold mb-8 text-slate-900">{title || 'Untitled Article'}</h1>
                <div className="prose prose-lg prose-slate max-w-none prose-a:text-blue-600 hover:prose-a:text-blue-800 prose-headings:text-slate-900 prose-img:rounded-xl">
                  <ArticleRenderer source={deferredContent} preloadedProducts={productPreviewMap} />
                </div>
              </div>
            </TabsContent>

            {/* TAB: HTML OUTPUT */}
            <TabsContent value="html" className="mt-0 outline-none">
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
      {showProductModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
               <div className="flex gap-6">
                 <button 
                  onClick={() => setModalMode('product')}
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
               <Button variant="ghost" size="icon" onClick={() => setShowProductModal(false)} className="rounded-full h-8 w-8 hover:bg-slate-200">
                 <X className="w-4 h-4 text-slate-500" />
               </Button>
            </div>
            
            {modalMode === 'product' ? (
              <div className="p-6 max-h-[450px] overflow-y-auto bg-white space-y-2">
                {products.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-sm">Loading database...</div>
                ) : (
                  products.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group">
                      <div className="min-w-0 pr-4">
                        <h4 className="text-sm font-bold text-slate-800 truncate">{p.title}</h4>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">{p.slug}</p>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => insertProductCode(p.slug)}
                        className="bg-white text-slate-700 font-semibold border border-slate-200 shadow-sm hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors"
                      >
                        Insert
                      </Button>
                    </div>
                  ))
                )}
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
      )}
    </div>
  )
}
