'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
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
  Bold, Italic, Link as LinkIcon, Heading2, Heading3, Quote, Code, List, RefreshCw,
  Search, Upload, Package, ShoppingCart
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs'
import { ArticleRenderer, compileArticleSourceToHtml } from '@/components/article-renderer'
import { SITE_DOMAIN } from '@/lib/site-config'

interface SerializedSelectionPoint {
  path: number[]
  offset: number
}

interface SerializedSelectionRange {
  start: SerializedSelectionPoint
  end: SerializedSelectionPoint
  collapsed: boolean
}

interface ArticleEditorProps {
  initialData?: {
    originalSlug?: string
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

const internalTrackingStaff = [
  'walid',
  'yassine',
  'jebbar',
  'janah',
  'amine',
  'abdo',
  'mehdi',
  'othmane',
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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function decodeHtmlEntities(value: string) {
  if (typeof document === 'undefined') return value
  const textarea = document.createElement('textarea')
  textarea.innerHTML = value
  return textarea.value
}

function normalizeAbsoluteUrl(url: string) {
  const trimmed = url.trim()
  if (!trimmed) return ''
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

export function ArticleEditor({ initialData, mode, initialWriters = [], initialProducts = [] }: ArticleEditorProps) {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const editorHtmlRef = useRef(initialData?.content || '')
  const savedRangeRef = useRef<Range | null>(null)
  const savedSelectionRef = useRef<SerializedSelectionRange | null>(null)
  const validationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const titleInputRef = useRef<HTMLTextAreaElement>(null)
  const amazonMetadataUrlRef = useRef<string | null>(null)

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
  const [validationError, setValidationError] = useState<string | null>(null)
  
  // Use passed server-rendered data to prevent client waterfalls
  const editors = initialWriters;
  const [products, setProducts] = useState(initialProducts)
  const listedByOptions = useMemo(() => internalTrackingStaff, [])
  
  const [showProductModal, setShowProductModal] = useState(false)
  const [modalMode, setModalMode] = useState<'product' | 'embed' | 'amazon'>('product')
  const [embedCode, setEmbedCode] = useState('')
  const [amazonUrl, setAmazonUrl] = useState('')
  const [amazonTitle, setAmazonTitle] = useState('')
  const [amazonDescription, setAmazonDescription] = useState('')
  const [amazonImageUrl, setAmazonImageUrl] = useState('')
  const [amazonPrice, setAmazonPrice] = useState('')
  const [amazonCtaLabel, setAmazonCtaLabel] = useState('View details')
  const [fetchingAmazonMetadata, setFetchingAmazonMetadata] = useState(false)
  const [activeTab, setActiveTab] = useState<'write' | 'seo' | 'preview' | 'html'>('write')
  const [hasMounted, setHasMounted] = useState(false)
  const [htmlOutput, setHtmlOutput] = useState(() => compileArticleSourceToHtml(initialData?.content || ''))
  const [productSearch, setProductSearch] = useState('')
  const [productDomainFilter, setProductDomainFilter] = useState<string | null>(null)
  const [loadedProductImages, setLoadedProductImages] = useState<Record<string, boolean>>({})
  const [productsLoading, setProductsLoading] = useState(false)
  const [productsLoadError, setProductsLoadError] = useState<string | null>(null)
  const productPreviewMap = useMemo(() => Object.fromEntries(
    products.map((product: any) => [product.slug, product]),
  ), [products])

  const refreshProducts = useCallback(async () => {
    setProductsLoading(true)
    setProductsLoadError(null)

    try {
      const response = await fetch(`/api/products?published=false&full=true&_=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store',
      })

      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to fetch the latest products.')
      }

      const latestProducts = Array.isArray(payload) ? payload : []
      setProducts(latestProducts)
    } catch (error: any) {
      setProductsLoadError(error?.message || 'Could not refresh products.')
    } finally {
      setProductsLoading(false)
    }
  }, [])

  const buildProductPlaceholderHtml = (slug: string) => {
    const product = productPreviewMap[slug]
    const title = product?.title || slug
    const brand = product?.brand || 'Product card'
    const imageUrl = product?.image_url

    return `
      <div contenteditable="false" data-product-shortcode="${escapeHtml(slug)}" class="not-prose block w-full clear-both my-6 rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-white shadow-sm overflow-hidden">
        <div class="flex items-center gap-4 p-4">
          <div class="w-16 h-16 rounded-xl overflow-hidden border border-orange-100 bg-white flex items-center justify-center flex-shrink-0">
            ${imageUrl
              ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(title)}" class="w-full h-full object-cover" />`
              : `<span class="text-[10px] font-bold uppercase tracking-wider text-orange-400">Product</span>`}
          </div>
          <div class="min-w-0 flex-1">
            <div class="text-[10px] font-black uppercase tracking-[0.22em] text-orange-600 mb-1">Embedded Product Card</div>
            <div class="text-sm font-bold text-slate-900 leading-snug line-clamp-2">${escapeHtml(title)}</div>
            <div class="mt-1 text-xs text-slate-500">${escapeHtml(brand)}</div>
          </div>
          <div class="hidden sm:flex items-center rounded-full bg-orange-600 text-white px-3 py-1.5 text-[11px] font-bold whitespace-nowrap">
            Live Product Block
          </div>
        </div>
      </div>
    `.trim()
  }

  const buildEmbedPlaceholderHtml = (rawHtml: string, label: string, hint: string) => {
    const encodedHtml = escapeHtml(encodeURIComponent(rawHtml))

    return `
      <div contenteditable="false" data-embed-html="${encodedHtml}" class="not-prose block w-full clear-both my-6 rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white shadow-sm overflow-hidden">
        <div class="flex items-center gap-4 p-4">
          <div class="w-16 h-16 rounded-xl overflow-hidden border border-sky-100 bg-white flex items-center justify-center flex-shrink-0">
            <span class="text-[10px] font-black uppercase tracking-[0.22em] text-sky-500">Embed</span>
          </div>
          <div class="min-w-0 flex-1">
            <div class="text-[10px] font-black uppercase tracking-[0.22em] text-sky-600 mb-1">${escapeHtml(label)}</div>
            <div class="text-sm font-bold text-slate-900 leading-snug line-clamp-2">${escapeHtml(hint)}</div>
            <div class="mt-1 text-xs text-slate-500">Rendered safely in preview and on the live article.</div>
          </div>
          <div class="hidden sm:flex items-center rounded-full bg-sky-600 text-white px-3 py-1.5 text-[11px] font-bold whitespace-nowrap">
            Live Embed Block
          </div>
        </div>
      </div>
    `.trim()
  }

  const buildAmazonCardSourceHtml = ({
    url,
    title,
    description,
    imageUrl,
    priceText,
    ctaLabel,
  }: {
    url: string
    title: string
    description?: string
    imageUrl?: string
    priceText?: string
    ctaLabel?: string
  }) => {
    const attributes = [
      `data-url="${escapeHtml(url)}"`,
      `data-title="${escapeHtml(title)}"`,
      description ? `data-description="${escapeHtml(description)}"` : '',
      imageUrl ? `data-image-url="${escapeHtml(imageUrl)}"` : '',
      priceText ? `data-price="${escapeHtml(priceText)}"` : '',
      ctaLabel ? `data-cta-label="${escapeHtml(ctaLabel)}"` : '',
    ].filter(Boolean)

    return `<amazon-product-card ${attributes.join(' ')}></amazon-product-card>`
  }

  const buildAmazonCardPlaceholderHtml = ({
    rawHtml,
    title,
    description,
    imageUrl,
    priceText,
  }: {
    rawHtml: string
    title: string
    description?: string
    imageUrl?: string
    priceText?: string
  }) => {
    const encodedHtml = escapeHtml(encodeURIComponent(rawHtml))

    return `
      <div contenteditable="false" data-embed-html="${encodedHtml}" class="not-prose block w-full clear-both my-6 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white shadow-sm overflow-hidden">
        <div class="flex items-center gap-4 p-4">
          <div class="w-16 h-16 rounded-xl overflow-hidden border border-amber-100 bg-white flex items-center justify-center flex-shrink-0">
            ${imageUrl
              ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(title)}" class="w-full h-full object-cover" />`
              : `<span class="text-[10px] font-black uppercase tracking-[0.22em] text-amber-500">Amazon</span>`}
          </div>
          <div class="min-w-0 flex-1">
            <div class="text-[10px] font-black uppercase tracking-[0.22em] text-amber-600 mb-1">External Product Card</div>
            <div class="text-sm font-bold text-slate-900 leading-snug line-clamp-2">${escapeHtml(title)}</div>
            <div class="mt-1 text-xs text-slate-500 line-clamp-2">${escapeHtml(description || 'Saved directly in this article. No separate product database record needed.')}</div>
            ${priceText ? `<div class="mt-2 text-sm font-black tracking-tight text-slate-900">${escapeHtml(priceText)}</div>` : ''}
          </div>
          <div class="hidden sm:flex items-center rounded-full bg-amber-500 text-slate-900 px-3 py-1.5 text-[11px] font-bold whitespace-nowrap">
            Live Amazon Block
          </div>
        </div>
      </div>
    `.trim()
  }

  const replaceNodeWithHtml = (node: Element, html: string) => {
    const wrapper = document.createElement('div')
    wrapper.innerHTML = html
    node.replaceWith(...Array.from(wrapper.childNodes))
  }

  const decorateExistingEmbeds = (container: HTMLDivElement) => {
    container.querySelectorAll('amazon-product-card').forEach((card) => {
      const title = card.getAttribute('data-title') || 'Amazon Product'
      const description = card.getAttribute('data-description') || card.getAttribute('data-url') || ''
      const imageUrl = card.getAttribute('data-image-url') || undefined
      const priceText = card.getAttribute('data-price') || undefined
      replaceNodeWithHtml(
        card,
        buildAmazonCardPlaceholderHtml({
          rawHtml: card.outerHTML,
          title,
          description,
          imageUrl,
          priceText,
        }),
      )
    })

    container.querySelectorAll('blockquote.twitter-tweet').forEach((blockquote) => {
      const next = blockquote.nextElementSibling
      let rawHtml = blockquote.outerHTML
      if (next?.tagName === 'SCRIPT' && /platform\.twitter\.com\/widgets\.js/i.test(next.getAttribute('src') || '')) {
        rawHtml += next.outerHTML
        next.remove()
      }
      replaceNodeWithHtml(blockquote, buildEmbedPlaceholderHtml(rawHtml, 'Twitter Embed', 'Tweet post'))
    })

    container.querySelectorAll('blockquote.tiktok-embed').forEach((blockquote) => {
      const next = blockquote.nextElementSibling
      let rawHtml = blockquote.outerHTML
      if (next?.tagName === 'SCRIPT') {
        rawHtml += next.outerHTML
        next.remove()
      }
      replaceNodeWithHtml(blockquote, buildEmbedPlaceholderHtml(rawHtml, 'TikTok Embed', 'Short-form social post'))
    })

    container.querySelectorAll('iframe').forEach((iframe) => {
      const src = iframe.getAttribute('src') || 'Embedded media'
      replaceNodeWithHtml(iframe, buildEmbedPlaceholderHtml(iframe.outerHTML, 'Iframe Embed', src))
    })

    container.querySelectorAll('script[src]').forEach((script) => {
      const src = script.getAttribute('src') || 'External script'
      replaceNodeWithHtml(script, buildEmbedPlaceholderHtml(script.outerHTML, 'Script Embed', src))
    })
  }

  const decorateEditorContent = (rawContent: string) => {
    if (!rawContent) return ''
    const container = document.createElement('div')
    container.innerHTML = rawContent.replace(/\[product-card:([^\]]+)\]/g, (_, slug: string) => buildProductPlaceholderHtml(slug))
    decorateExistingEmbeds(container)
    return container.innerHTML
  }

  const serializeEditorContent = (rawHtml: string) => {
    const container = document.createElement('div')
    container.innerHTML = rawHtml
    container.querySelectorAll<HTMLElement>('[data-product-shortcode]').forEach((node) => {
      const slug = node.getAttribute('data-product-shortcode')
      if (!slug) return
      node.replaceWith(document.createTextNode(`[product-card:${slug}]`))
    })
    container.querySelectorAll<HTMLElement>('[data-embed-html]').forEach((node) => {
      const encodedHtml = node.getAttribute('data-embed-html')
      if (!encodedHtml) return
      const decodedHtml = decodeURIComponent(decodeHtmlEntities(encodedHtml))
      const wrapper = document.createElement('div')
      wrapper.innerHTML = decodedHtml
      node.replaceWith(...Array.from(wrapper.childNodes))
    })
    return container.innerHTML
  }

  const getNodePath = (node: Node, root: Node) => {
    const path: number[] = []
    let current: Node | null = node

    while (current && current !== root) {
      const parentNode: Node | null = current.parentNode
      if (!parentNode) return null
      const index = Array.prototype.indexOf.call(parentNode.childNodes, current)
      if (index < 0) return null
      path.unshift(index)
      current = parentNode
    }

    return current === root ? path : null
  }

  const getNodeFromPath = (root: Node, path: number[]) => {
    let current: Node | null = root
    for (const index of path) {
      current = current?.childNodes[index] ?? null
      if (!current) return null
    }
    return current
  }

  const clampOffset = (node: Node, offset: number) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return Math.min(offset, node.textContent?.length ?? 0)
    }
    return Math.min(offset, node.childNodes.length)
  }

  const serializeRange = (range: Range, root: HTMLElement): SerializedSelectionRange | null => {
    const startPath = getNodePath(range.startContainer, root)
    const endPath = getNodePath(range.endContainer, root)
    if (!startPath || !endPath) return null

    return {
      start: { path: startPath, offset: range.startOffset },
      end: { path: endPath, offset: range.endOffset },
      collapsed: range.collapsed,
    }
  }

  const deserializeRange = (serialized: SerializedSelectionRange, root: HTMLElement) => {
    const startNode = getNodeFromPath(root, serialized.start.path)
    const endNode = getNodeFromPath(root, serialized.end.path)
    if (!startNode || !endNode) return null

    const range = document.createRange()
    range.setStart(startNode, clampOffset(startNode, serialized.start.offset))
    range.setEnd(endNode, clampOffset(endNode, serialized.end.offset))
    return range
  }

  const saveSelectionRange = () => {
    if (!editorRef.current || typeof window === 'undefined') return

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const commonNode = range.commonAncestorContainer
    const editor = editorRef.current
    const isInsideEditor =
      commonNode === editor ||
      editor.contains(commonNode.nodeType === Node.ELEMENT_NODE ? commonNode : commonNode.parentNode)

    if (!isInsideEditor) return

    savedRangeRef.current = range.cloneRange()
    savedSelectionRef.current = serializeRange(range, editor)
  }

  const restoreSelectionRange = () => {
    if (!editorRef.current || typeof window === 'undefined') return null

    const selection = window.getSelection()
    if (!selection) return null

    selection.removeAllRanges()

    if (savedSelectionRef.current) {
      const restoredRange = deserializeRange(savedSelectionRef.current, editorRef.current)
      if (restoredRange) {
        selection.addRange(restoredRange)
        savedRangeRef.current = restoredRange.cloneRange()
        return restoredRange
      }
    }

    if (savedRangeRef.current) {
      try {
        selection.addRange(savedRangeRef.current)
        return savedRangeRef.current
      } catch {
        savedRangeRef.current = null
      }
    }

    const fallbackRange = document.createRange()
    fallbackRange.selectNodeContents(editorRef.current)
    fallbackRange.collapse(false)
    selection.addRange(fallbackRange)
    savedRangeRef.current = fallbackRange.cloneRange()
    savedSelectionRef.current = serializeRange(fallbackRange, editorRef.current)
    return fallbackRange
  }

  const insertHtmlAtSelection = (html: string) => {
    if (!editorRef.current) return

    // Capture the cursors refs before .focus(), because .focus() fires onFocus
    // which calls saveSelectionRange() and overwrites them with the browser default.
    const capturedSel = savedSelectionRef.current
    const capturedRange = savedRangeRef.current ? savedRangeRef.current.cloneRange() : null

    editorRef.current.focus()

    // Restore the pre-focus position so restoreSelectionRange() uses the correct spot.
    savedSelectionRef.current = capturedSel
    savedRangeRef.current = capturedRange

    const range = restoreSelectionRange()
    if (!range) return

    range.deleteContents()
    const fragment = range.createContextualFragment(html)
    const lastNode = fragment.lastChild
    range.insertNode(fragment)

    const selection = window.getSelection()
    if (selection) {
      selection.removeAllRanges()
      const nextRange = document.createRange()
      if (lastNode) {
        nextRange.setStartAfter(lastNode)
      } else {
        nextRange.selectNodeContents(editorRef.current)
        nextRange.collapse(false)
      }
      nextRange.collapse(true)
      selection.addRange(nextRange)
      savedRangeRef.current = nextRange.cloneRange()
      if (editorRef.current) {
        savedSelectionRef.current = serializeRange(nextRange, editorRef.current)
      }
    }

    syncEditorContent()
  }

  const isBlockContainerTag = (tagName: string) => {
    return ['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE'].includes(tagName)
  }

  const hasMeaningfulFragmentContent = (fragment: DocumentFragment) => {
    if ((fragment.textContent || '').replace(/\u200B/g, '').trim()) return true
    return Array.from(fragment.childNodes).some((node) => {
      if (!(node instanceof HTMLElement)) return false
      return ['BR', 'IMG', 'IFRAME', 'BLOCKQUOTE', 'UL', 'OL'].includes(node.tagName) || node.hasAttribute('data-product-shortcode') || node.hasAttribute('data-embed-html')
    })
  }

  const createBlockFromFragment = (tagName: string, fragment: DocumentFragment) => {
    const element = document.createElement(tagName.toLowerCase())
    element.appendChild(fragment)
    return element
  }

  const placeCaretAtStart = (node: Node) => {
    const selection = window.getSelection()
    if (!selection) return
    const range = document.createRange()
    range.selectNodeContents(node)
    range.collapse(true)
    selection.removeAllRanges()
    selection.addRange(range)
    savedRangeRef.current = range.cloneRange()
    if (editorRef.current) {
      savedSelectionRef.current = serializeRange(range, editorRef.current)
    }
  }

  const placeCaretAfterNode = (node: Node) => {
    const selection = window.getSelection()
    if (!selection) return
    const range = document.createRange()
    range.setStartAfter(node)
    range.collapse(true)
    selection.removeAllRanges()
    selection.addRange(range)
    savedRangeRef.current = range.cloneRange()
    if (editorRef.current) {
      savedSelectionRef.current = serializeRange(range, editorRef.current)
    }
  }

  const insertBlockHtmlAtSelection = (html: string) => {
    if (!editorRef.current) return

    // Capture the cursor refs before .focus() fires onFocus -> saveSelectionRange()
    // which would overwrite them with the browser's default (usually top of editor).
    const capturedSel = savedSelectionRef.current
    const capturedRange = savedRangeRef.current ? savedRangeRef.current.cloneRange() : null

    editorRef.current.focus()

    // Restore the captured position so we insert where the user actually clicked.
    savedSelectionRef.current = capturedSel
    savedRangeRef.current = capturedRange

    const range = restoreSelectionRange()
    if (!range) return

    const startNode =
      range.startContainer.nodeType === Node.ELEMENT_NODE
        ? range.startContainer as Element
        : range.startContainer.parentElement
    const blockParent = startNode?.closest('p, div, h1, h2, h3, h4, h5, h6, blockquote')
    const hostBlock =
      blockParent && blockParent !== editorRef.current && isBlockContainerTag(blockParent.tagName)
        ? blockParent
        : null

    if (!hostBlock || !editorRef.current.contains(hostBlock)) {
      insertHtmlAtSelection(html)
      return
    }

    const beforeRange = document.createRange()
    beforeRange.selectNodeContents(hostBlock)
    beforeRange.setEnd(range.startContainer, range.startOffset)
    const beforeFragment = beforeRange.cloneContents()

    const afterRange = document.createRange()
    afterRange.selectNodeContents(hostBlock)
    afterRange.setStart(range.endContainer, range.endOffset)
    const afterFragment = afterRange.cloneContents()

    const placeholderWrapper = document.createElement('div')
    placeholderWrapper.innerHTML = html
    const placeholderNodes = Array.from(placeholderWrapper.childNodes)
    const insertionParent = hostBlock.parentNode
    if (!insertionParent) return

    const nodesToInsert: Node[] = []
    let trailingBlock: HTMLElement | null = null

    if (hasMeaningfulFragmentContent(beforeFragment)) {
      nodesToInsert.push(createBlockFromFragment(hostBlock.tagName, beforeFragment))
    }

    nodesToInsert.push(...placeholderNodes)

    if (hasMeaningfulFragmentContent(afterFragment)) {
      trailingBlock = createBlockFromFragment(hostBlock.tagName, afterFragment)
      nodesToInsert.push(trailingBlock)
    }

    nodesToInsert.forEach((node) => insertionParent.insertBefore(node, hostBlock))
    hostBlock.remove()

    if (trailingBlock) {
      placeCaretAtStart(trailingBlock)
    } else if (placeholderNodes.length > 0) {
      placeCaretAfterNode(placeholderNodes[placeholderNodes.length - 1])
    }

    syncEditorContent()
  }

  const getEditableSibling = (node: Node | null, direction: 'previous' | 'next'): Node | null => {
    let current = node
    while (current) {
      current = direction === 'previous' ? current.previousSibling : current.nextSibling
      if (!current) return null
      if (current.nodeType === Node.TEXT_NODE && !(current.textContent || '').trim()) continue
      return current
    }
    return null
  }

  const handleEditorKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Backspace' && event.key !== 'Delete') return
    if (!editorRef.current) return

    const selection = window.getSelection()
    if (!selection || !selection.isCollapsed || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    let targetNode: Node | null = null

    if (event.key === 'Backspace') {
      if (range.startContainer.nodeType === Node.TEXT_NODE && range.startOffset > 0) return
      targetNode =
        range.startContainer.nodeType === Node.TEXT_NODE
          ? getEditableSibling(range.startContainer, 'previous')
          : (range.startContainer.childNodes[range.startOffset - 1] ?? getEditableSibling(range.startContainer, 'previous'))
    } else {
      if (
        range.startContainer.nodeType === Node.TEXT_NODE &&
        range.startOffset < (range.startContainer.textContent || '').length
      ) {
        return
      }
      targetNode =
        range.startContainer.nodeType === Node.TEXT_NODE
          ? getEditableSibling(range.startContainer, 'next')
          : (range.startContainer.childNodes[range.startOffset] ?? getEditableSibling(range.startContainer, 'next'))
    }

    if (!(targetNode instanceof HTMLElement)) return
    if (!targetNode.matches('[data-product-shortcode], [data-embed-html]')) return

    event.preventDefault()
    targetNode.remove()
    syncEditorContent()
    saveSelectionRange()
  }

  // Automatically set author on mount if absent
  useEffect(() => {
    if (mode === 'edit' && initialData?.author && !author) {
      setAuthor(initialData.author)
    }
  }, [mode, initialData?.author, author])

  useEffect(() => {
    if (listedBy && !internalTrackingStaff.includes(listedBy.toLowerCase())) {
      setListedBy('')
    }
  }, [listedBy])

  useEffect(() => {
    setProducts(initialProducts)
  }, [initialProducts])

  useEffect(() => {
    setHasMounted(true)
  }, [])

  useEffect(() => {
    if (!showProductModal || modalMode !== 'product') return
    void refreshProducts()
  }, [showProductModal, modalMode, refreshProducts])

  useEffect(() => {
    if (!hasMounted) return

    editorHtmlRef.current = content

    if (activeTab !== 'write' || !editorRef.current) return

    const currentSerialized = serializeEditorContent(editorRef.current.innerHTML)
    if (currentSerialized !== content) {
      editorRef.current.innerHTML = decorateEditorContent(content)
    }
  }, [activeTab, content, hasMounted])

  useEffect(() => {
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!titleInputRef.current) return
    titleInputRef.current.style.height = '0px'
    titleInputRef.current.style.height = `${titleInputRef.current.scrollHeight}px`
  }, [title])

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
    let contentToSave = content

    if (activeTab === 'html') {
      contentToSave = htmlOutput
      editorHtmlRef.current = contentToSave
      if (contentToSave !== content) {
        setContent(contentToSave)
      }
    } else if (activeTab === 'write' && editorRef.current) {
      contentToSave = serializeEditorContent(editorRef.current.innerHTML)
      editorHtmlRef.current = contentToSave
      if (contentToSave !== content) {
        setContent(contentToSave)
      }
    }

    // ── Base validation ──────────────────────────────────────────────────
    if (!(title || '').trim()) {
      toast({ title: 'Missing title', description: 'Add an article title before saving.', variant: 'destructive' })
      return
    }
    if (!(slug || '').trim()) {
      toast({ title: 'Missing slug', description: 'A URL slug is required.', variant: 'destructive' })
      return
    }
    if (!(contentToSave || '').trim()) {
      toast({ title: 'No content', description: 'Write something in the workspace before saving.', variant: 'destructive' })
      return
    }

    // helper to show inline error and auto-clear after 5s
    const showError = (msg: string) => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current)
      }
      setValidationError(msg)
      validationTimeoutRef.current = setTimeout(() => setValidationError(null), 5000)
    }

    // ── Publish-only validation ──────────
    if (publish) {
      if (!(imageUrl || '').trim()) {
        showError('📷 A featured image URL is required before publishing. Add one in the sidebar.')
        return
      }
      if (!(author || '').trim()) {
        showError('✍️ An author is required before publishing. Choose one in the sidebar.')
        return
      }
      if (!(category || '').trim()) {
        showError('📂 A category is required before publishing. Choose one in the sidebar.')
        return
      }
      if (!(listedBy || '').trim()) {
        showError('🧾 "Listed By" is required before publishing. Select a staff member in the Internal Tracking section of the sidebar.')
        return
      }
    }

    publish ? setPublishing(true) : setSaving(true)

    try {
      const plainText = (contentToSave || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      const derivedMetaDescription = (metaDescription || '').trim() || plainText.substring(0, 155).trimEnd()
      const derivedOgTitle = (ogTitle || '').trim() || (title || '').trim()
      const derivedOgDescription = (ogDescription || '').trim() || derivedMetaDescription
      const derivedOgImage = (ogImage || '').trim() || (imageUrl || '').trim() || ''
      const derivedFocusKeyword = (focusKeyword || '').trim() || (category || '').trim()
      const titleWords = (title || '').toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 3)
      const derivedMetaKeywords = (metaKeywords || '').trim() || [(category || '').toLowerCase(), ...titleWords].slice(0, 8).join(', ')

      const willBePublished = publish || Boolean(initialData?.published)
      const publishedAtValue = willBePublished
        ? (initialData?.published_at || new Date().toISOString())
        : null

      const payload = {
        slug, title, content: contentToSave, author, category,
        image_url: imageUrl || null,
        read_time: readTime,
        published: willBePublished,
        published_at: publishedAtValue,
        article_type: articleType,
        generation_status: willBePublished ? 'published' : generationStatus,
        meta_description: derivedMetaDescription || null,
        meta_keywords: derivedMetaKeywords || null,
        focus_keyword: derivedFocusKeyword || null,
        og_title: derivedOgTitle || null,
        og_description: derivedOgDescription || null,
        og_image: derivedOgImage || null,
        canonical_url: canonicalUrl || null,
        listed_by: listedBy || null,
      }

      const apiUrl = mode === 'create'
        ? '/api/articles'
        : `/api/articles/${initialData?.originalSlug || initialData?.slug || slug}`
      const apiMethod = mode === 'create' ? 'POST' : 'PUT'

      const response = await fetch(apiUrl, {
        method: apiMethod,
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
        } catch { /* ignore */ }
        throw new Error(message)
      }

      setValidationError(null)
      toast({ title: publish ? 'Article published! 🚀' : (initialData?.published ? 'Article saved ✓' : 'Draft saved ✓') })
      router.push('/admin/articles')
      router.refresh()
    } catch (error: any) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' })
    } finally {
      setSaving(false)
      setPublishing(false)
    }
  }

  // --- WYSIWYG Editor Helpers (execCommand-based) ---
  const exec = (command: string, value?: string) => {
    editorRef.current?.focus()
    restoreSelectionRange()
    document.execCommand(command, false, value)
    syncEditorContent()
    saveSelectionRange()
  }

  const syncEditorContent = () => {
    if (editorRef.current) {
      const nextContent = serializeEditorContent(editorRef.current.innerHTML)
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
    saveSelectionRange()
    const url = window.prompt('Enter link URL:')
    if (url) exec('createLink', url)
  }

  const insertProductCode = (productSlug: string) => {
    if (!editorRef.current) return
    insertBlockHtmlAtSelection(buildProductPlaceholderHtml(productSlug))
    setShowProductModal(false)
    toast({ title: 'Product Inserted', description: `Product block inserted into the workspace.` })
  }

  const handleInsertEmbed = () => {
    if (!embedCode.trim() || !editorRef.current) return
    const embedLabel = /twitter-tweet/i.test(embedCode)
      ? 'Twitter Embed'
      : /tiktok-embed/i.test(embedCode)
        ? 'TikTok Embed'
        : /iframe/i.test(embedCode)
          ? 'Iframe Embed'
          : 'Custom Embed'
    const embedHint = /twitter\.com|x\.com/i.test(embedCode)
      ? 'Tweet post'
      : /tiktok/i.test(embedCode)
        ? 'Short-form social post'
        : /src=["']([^"']+)["']/i.exec(embedCode)?.[1] || 'Embedded content'

    insertBlockHtmlAtSelection(buildEmbedPlaceholderHtml(embedCode, embedLabel, embedHint))
    setEmbedCode('')
    setShowProductModal(false)
    toast({ title: 'Embed Code Inserted' })
  }

  const resetAmazonForm = () => {
    setAmazonUrl('')
    setAmazonTitle('')
    setAmazonDescription('')
    setAmazonImageUrl('')
    setAmazonPrice('')
    setAmazonCtaLabel('View details')
    amazonMetadataUrlRef.current = null
  }

  const handlePullAmazonMetadata = useCallback(async ({
    overwrite = false,
    silent = false,
  }: {
    overwrite?: boolean
    silent?: boolean
  } = {}) => {
    const normalizedUrl = normalizeAbsoluteUrl(amazonUrl)
    const domain = extractCleanDomain(normalizedUrl)

    if (!normalizedUrl) {
      if (!silent) {
        toast({
          title: 'Missing Amazon URL',
          description: 'Paste the Amazon product link first.',
          variant: 'destructive',
        })
      }
      return
    }

    if (!domain || (!domain.includes('amazon.') && domain !== 'amzn.to')) {
      if (!silent) {
        toast({
          title: 'Amazon link required',
          description: 'This auto-fill tool only works with Amazon product links.',
          variant: 'destructive',
        })
      }
      return
    }

    if (
      !overwrite &&
      amazonMetadataUrlRef.current === normalizedUrl &&
      (amazonTitle.trim() || amazonDescription.trim() || amazonImageUrl.trim())
    ) {
      return
    }

    setFetchingAmazonMetadata(true)

    try {
      const response = await fetch('/api/products/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalizedUrl }),
      })

      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(payload?.message || 'Could not pull Amazon product details.')
      }

      if (payload?.title && (overwrite || !amazonTitle.trim())) {
        setAmazonTitle(payload.title)
      }

      if (payload?.description && (overwrite || !amazonDescription.trim())) {
        setAmazonDescription(payload.description)
      }

      if (payload?.image_url && (overwrite || !amazonImageUrl.trim())) {
        setAmazonImageUrl(payload.image_url)
      }

      if (payload?.price_text && (overwrite || !amazonPrice.trim())) {
        setAmazonPrice(payload.price_text)
      }

      amazonMetadataUrlRef.current = normalizedUrl

      if (!silent) {
        toast({
          title: 'Amazon details imported',
          description: payload?.title
            ? 'The card title and available product details were pulled from the Amazon page metadata.'
            : 'Available Amazon product metadata was imported.',
        })
      }
    } catch (error: any) {
      if (!silent) {
        toast({
          title: 'Metadata fetch failed',
          description: error.message,
          variant: 'destructive',
        })
      }
    } finally {
      setFetchingAmazonMetadata(false)
    }
  }, [amazonDescription, amazonImageUrl, amazonPrice, amazonTitle, amazonUrl])

  useEffect(() => {
    if (!showProductModal || modalMode !== 'amazon') return

    const normalizedUrl = normalizeAbsoluteUrl(amazonUrl)
    const domain = extractCleanDomain(normalizedUrl)
    if (!normalizedUrl || !domain || (!domain.includes('amazon.') && domain !== 'amzn.to')) return
    if (amazonMetadataUrlRef.current === normalizedUrl) return

    const timeout = setTimeout(() => {
      void handlePullAmazonMetadata({ overwrite: true, silent: true })
    }, 650)

    return () => clearTimeout(timeout)
  }, [amazonUrl, modalMode, showProductModal, handlePullAmazonMetadata])

  const handleInsertAmazonCard = () => {
    if (!editorRef.current) return

    const trimmedUrl = amazonUrl.trim()
    const trimmedTitle = amazonTitle.trim()
    const trimmedDescription = amazonDescription.trim()
    const trimmedImageUrl = amazonImageUrl.trim()
    const trimmedPrice = amazonPrice.trim()
    const trimmedCtaLabel = amazonCtaLabel.trim() || 'View details'

    if (!trimmedUrl) {
      toast({ title: 'Missing Amazon URL', description: 'Paste the Amazon product link first.', variant: 'destructive' })
      return
    }

    const domain = extractCleanDomain(trimmedUrl)
    if (!domain || (!domain.includes('amazon.') && domain !== 'amzn.to')) {
      toast({ title: 'Amazon link required', description: 'This separate card tool is only for Amazon product links.', variant: 'destructive' })
      return
    }

    if (!trimmedTitle) {
      toast({ title: 'Missing title', description: 'Add the product title you want the card to show.', variant: 'destructive' })
      return
    }

    if (!trimmedPrice) {
      toast({ title: 'Missing price', description: 'Add the product price so the Amazon card feels complete.', variant: 'destructive' })
      return
    }

    const rawHtml = buildAmazonCardSourceHtml({
      url: trimmedUrl,
      title: trimmedTitle,
      description: trimmedDescription,
      imageUrl: trimmedImageUrl,
      priceText: trimmedPrice,
      ctaLabel: trimmedCtaLabel,
    })

    insertBlockHtmlAtSelection(
      buildAmazonCardPlaceholderHtml({
        rawHtml,
        title: trimmedTitle,
        description: trimmedDescription || domain,
        imageUrl: trimmedImageUrl || undefined,
        priceText: trimmedPrice,
      }),
    )

    resetAmazonForm()
    setShowProductModal(false)
    toast({ title: 'Amazon Product Card Inserted' })
  }

  const compiledHtml = useMemo(() => compileArticleSourceToHtml(content), [content])

  useEffect(() => {
    if (activeTab !== 'html') {
      setHtmlOutput(compiledHtml)
    }
  }, [compiledHtml, activeTab])

  if (!hasMounted) {
    return (
      <div className="relative pb-24">
        <div className="cms-editor-layout">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="h-16 rounded-xl bg-slate-100 animate-pulse" />
              <div className="h-10 w-72 rounded-lg bg-slate-100 animate-pulse" />
            </div>
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="h-12 border-b border-slate-100 bg-slate-50" />
              <div className="h-[720px] bg-slate-50/40 animate-pulse" />
            </div>
          </div>
          <aside className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm h-64 animate-pulse" />
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm h-80 animate-pulse" />
          </aside>
        </div>
      </div>
    )
  }

  return (
    <div className="relative pb-24">
      {/* ── Fixed Bottom Action Bar ───────────────────────────────── */}
      {/* ── Inline Validation Error Banner ──────────────────────────── */}
      {validationError && (
        <div className="fixed bottom-[73px] left-0 right-0 lg:left-60 z-50 px-8">
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 flex items-center justify-between gap-4 shadow-lg animate-in slide-in-from-bottom-2 duration-200">
            <span className="text-sm font-medium">{validationError}</span>
            <button type="button" onClick={() => setValidationError(null)} className="text-red-400 hover:text-red-600 font-bold text-lg leading-none flex-shrink-0">×</button>
          </div>
        </div>
      )}

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
            type="button"
            variant="outline"
            className="border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 min-w-[120px]"
            onClick={() => handleSave(false)}
            disabled={saving || publishing}
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button 
            type="button"
            onClick={() => handleSave(true)} 
            disabled={saving || publishing}
            className="bg-blue-600 hover:bg-blue-700 font-bold min-w-[140px] shadow-md shadow-blue-500/20 text-white"
          >
            <Send className="mr-2 h-4 w-4" />
            {publishing ? 'Publishing...' : 'Publish'}
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
            
            <Textarea
              ref={titleInputRef}
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Article Title..."
              rows={2}
              className="w-full resize-none overflow-hidden text-3xl lg:text-4xl font-black leading-[1.08] tracking-tight min-h-[5.5rem] py-3 border-none bg-transparent focus-visible:ring-0 px-0 shadow-none placeholder:text-slate-300 text-slate-900"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.03em' }}
            />
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-md py-1.5 px-3 w-max max-w-full overflow-hidden">
              <Globe className="w-4 h-4 flex-shrink-0 text-slate-400" />
              <span className="text-sm text-slate-400 font-medium hidden sm:inline">{SITE_DOMAIN}/blog/</span>
              <input 
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="text-sm font-bold text-blue-600 bg-transparent border-none p-0 focus:ring-0 w-full sm:min-w-[200px]"
                placeholder="article-slug"
              />
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
                  <div className="flex items-center pl-2 gap-1">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onMouseDown={(e) => {
                        e.preventDefault()
                        saveSelectionRange()
                        savedRangeRef.current = null
                      }}
                      onClick={() => {
                        setModalMode('product')
                        setProductSearch('')
                        setShowProductModal(true)
                      }}
                      className="h-8 text-xs font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                    >
                      <Package className="h-4 w-4 mr-1.5" />
                      Insert Product
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onMouseDown={(e) => {
                        e.preventDefault()
                        saveSelectionRange()
                        savedRangeRef.current = null
                      }}
                      onClick={() => {
                        setModalMode('amazon')
                        setShowProductModal(true)
                      }}
                      className="h-8 text-xs font-bold text-amber-700 hover:text-amber-800 hover:bg-amber-50"
                    >
                      <ShoppingCart className="h-4 w-4 mr-1.5" />
                      Amazon Card
                    </Button>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onMouseDown={(e) => {
                        e.preventDefault()
                        saveSelectionRange()
                        savedRangeRef.current = null
                      }}
                      onClick={() => {
                        setModalMode('embed')
                        setShowProductModal(true)
                      }}
                      className="h-8 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    >
                      <Code className="h-4 w-4 mr-1.5" />
                      Embed Code
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
                  onKeyDown={handleEditorKeyDown}
                  onKeyUp={saveSelectionRange}
                  onMouseUp={saveSelectionRange}
                  onFocus={saveSelectionRange}
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
                  <span>WYSIWYG editor · Formatting applied directly · Product cards use shortcodes · Amazon cards stay inside article HTML</span>
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
                          <span className="text-xs text-[#4d5156]">{SITE_DOMAIN} › blog › {slug || 'article-slug'}</span>
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
              <div className="space-y-4">
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Advanced mode. HTML here stays synced with the write workspace. Changes made in either tab update the same article content.
                </div>
                <Textarea
                  value={htmlOutput}
                  onChange={(e) => {
                    const nextHtml = e.target.value
                    setHtmlOutput(nextHtml)
                    setContent(nextHtml)
                    editorHtmlRef.current = nextHtml
                  }}
                  placeholder="<!-- Generated HTML will appear here -->"
                  spellCheck={false}
                  className="min-h-[700px] resize-none rounded-xl border-slate-800 bg-slate-950 p-6 font-mono text-sm leading-relaxed text-emerald-300"
                />
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
                    {listedByOptions.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name.charAt(0).toUpperCase() + name.slice(1)}
                      </SelectItem>
                    ))}
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-[calc(100vw-2rem)] sm:max-w-2xl max-h-[calc(100vh-2rem)] overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-wrap justify-between items-start gap-3 bg-slate-50 flex-shrink-0">
               <div className="flex min-w-0 flex-wrap gap-x-4 gap-y-2 pr-2">
                 <button 
                   onClick={() => { setModalMode('product'); setProductSearch(''); setProductDomainFilter(null) }}
                  className={`text-sm font-bold pb-1 border-b-2 transition-all ${modalMode === 'product' ? 'text-blue-600 border-blue-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                 >
                   Insert Product Block
                 </button>
                 <button
                  onClick={() => setModalMode('amazon')}
                  className={`text-sm font-bold pb-1 border-b-2 transition-all ${modalMode === 'amazon' ? 'text-amber-700 border-amber-500' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                 >
                   Amazon Product
                 </button>
                 <button 
                  onClick={() => setModalMode('embed')}
                  className={`text-sm font-bold pb-1 border-b-2 transition-all ${modalMode === 'embed' ? 'text-blue-600 border-blue-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                 >
                   Raw Embed Code
                 </button>
               </div>
               <Button variant="ghost" size="icon" onClick={() => { setShowProductModal(false); setProductSearch(''); setProductDomainFilter(null); resetAmazonForm() }} className="rounded-full h-8 w-8 hover:bg-slate-200">
                 <X className="w-4 h-4 text-slate-500" />
               </Button>
            </div>
            
            {modalMode === 'product' ? (
              <div className="flex flex-col bg-white">
                {/* ── Search bar ── */}
                <div className="px-6 pt-4 pb-3 border-b border-slate-100 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
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
                    <button
                      type="button"
                      onClick={() => void refreshProducts()}
                      disabled={productsLoading}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:text-slate-700 hover:border-blue-300 disabled:opacity-60 disabled:cursor-not-allowed"
                      title="Refresh products"
                    >
                      <RefreshCw className={`h-4 w-4 ${productsLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  {(productsLoading || productsLoadError) && (
                    <div className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs ${
                      productsLoadError
                        ? 'border-amber-200 bg-amber-50 text-amber-700'
                        : 'border-sky-200 bg-sky-50 text-sky-700'
                    }`}>
                      <span>
                        {productsLoadError
                          ? `Using last available product list. ${productsLoadError}`
                          : 'Refreshing latest product cards from the database…'}
                      </span>
                    </div>
                  )}

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

                    if (products.length === 0 && productsLoading) {
                      return (
                        <div className="text-center py-10">
                          <RefreshCw className="w-8 h-8 text-slate-200 mx-auto mb-3 animate-spin" />
                          <p className="text-sm font-semibold text-slate-500">Loading latest products…</p>
                        </div>
                      )
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
                                onMouseDown={(e) => {
                                  e.preventDefault()
                                }}
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
            ) : modalMode === 'amazon' ? (
              <div className="p-4 sm:p-6 space-y-5 bg-white overflow-y-auto">
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  This block is completely separate from your native product database. It gets saved directly inside the article HTML only.
                </div>

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700">Amazon Product URL</Label>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Input
                        value={amazonUrl}
                        onChange={(e) => {
                          setAmazonUrl(e.target.value)
                          amazonMetadataUrlRef.current = null
                        }}
                        onBlur={() => {
                          if (!amazonTitle.trim()) {
                            void handlePullAmazonMetadata({ silent: true })
                          }
                        }}
                        placeholder="https://www.amazon.com/..."
                        className="bg-slate-50 border-slate-200"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => void handlePullAmazonMetadata({ overwrite: true })}
                        disabled={!amazonUrl.trim() || fetchingAmazonMetadata}
                        className="shrink-0 border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                      >
                        {fetchingAmazonMetadata ? 'Pulling...' : 'Pull Details'}
                      </Button>
                    </div>
                    <p className="text-xs text-slate-500">The title auto-fills from the Amazon link metadata when available.</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700">Card Title</Label>
                    <Input
                      value={amazonTitle}
                      onChange={(e) => setAmazonTitle(e.target.value)}
                      placeholder="Teenage Engineering OP-1 Field"
                      className="bg-slate-50 border-slate-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700">Short Note</Label>
                    <Textarea
                      value={amazonDescription}
                      onChange={(e) => setAmazonDescription(e.target.value)}
                      placeholder="Portable synthesizer, sampler & drum machine"
                      className="min-h-[92px] bg-slate-50 border-slate-200 resize-none"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-slate-700">Image URL (Optional)</Label>
                      <Input
                        value={amazonImageUrl}
                        onChange={(e) => setAmazonImageUrl(e.target.value)}
                        placeholder="https://..."
                        className="bg-slate-50 border-slate-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-slate-700">Price</Label>
                      <Input
                        value={amazonPrice}
                        onChange={(e) => setAmazonPrice(e.target.value)}
                        placeholder="$1,999"
                        className="bg-slate-50 border-slate-200"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-slate-700">CTA Label</Label>
                      <Input
                        value={amazonCtaLabel}
                        onChange={(e) => setAmazonCtaLabel(e.target.value)}
                        placeholder="View details"
                        className="bg-slate-50 border-slate-200"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="mb-3 text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">Preview Summary</p>
                  <div className="rounded-2xl border border-amber-200 bg-white shadow-sm overflow-hidden">
                    <div className="bg-[#131921] px-4 py-3 text-white">
                      <div className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-300">External Product Card</div>
                      <div className="mt-1 text-sm font-bold leading-snug text-white">
                        {amazonTitle.trim() || 'Amazon product title'}
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      <p className="text-sm text-slate-600">
                        {amazonDescription.trim() || 'This separate card is saved directly inside the article and does not create a product record in your database.'}
                      </p>
                      <div className="text-2xl font-black tracking-tight text-slate-900">
                        {amazonPrice.trim() || '$0'}
                      </div>
                      <div className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-700">
                        {extractCleanDomain(amazonUrl) || 'amazon.com'}
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  onMouseDown={(e) => {
                    e.preventDefault()
                  }}
                  onClick={handleInsertAmazonCard}
                  disabled={!amazonUrl.trim() || !amazonTitle.trim() || !amazonPrice.trim()}
                  className="w-full bg-amber-500 font-bold h-10 text-slate-900 hover:bg-amber-400"
                >
                  Insert Amazon Card
                </Button>
              </div>
            ) : (
              <div className="p-4 sm:p-6 space-y-4 bg-white overflow-y-auto">
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
                  onMouseDown={(e) => {
                    e.preventDefault()
                  }}
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
