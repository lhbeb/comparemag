import React from 'react'
import parse, { Element } from 'html-react-parser'
import { marked } from 'marked'
import { ProductCardEmbed, type ProductCardData } from './blocks/product-card-embed'

interface ArticleRendererProps {
  source: string
  preloadedProducts?: Record<string, ProductCardData>
}

function replaceProductShortcodes(source: string) {
  return source.replace(
    /\[product-card:([^\]]+)\]/g,
    '<product-embed data-slug="$1"></product-embed>',
  )
}

function looksLikeHtmlDocument(source: string) {
  const trimmed = source.trim()
  return /<\/?[a-z][\s\S]*>/i.test(trimmed)
}

export function compileArticleSourceToHtml(source: string) {
  const preparedSource = replaceProductShortcodes(source)

  if (looksLikeHtmlDocument(preparedSource)) {
    return preparedSource
  }

  return marked.parse(preparedSource, { async: false }) as string
}

function EmbeddedScript({ src }: { src: string }) {
  React.useEffect(() => {
    if (!src) return
    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing) {
      if (src.includes('instagram')) (window as any).instgrm?.Embeds?.process()
      if (src.includes('twitter')) (window as any).twttr?.widgets?.load()
      return
    }
    const script = document.createElement('script')
    script.src = src
    script.async = true
    document.body.appendChild(script)
  }, [src])
  return null
}

export function ArticleRenderer({ source, preloadedProducts = {} }: ArticleRendererProps) {
  const rawHtml = compileArticleSourceToHtml(source)

  const reactContent = parse(rawHtml, {
    replace: (domNode) => {
      // 1. Process Product embeds
      if (domNode instanceof Element && domNode.name === 'product-embed') {
        const slug = domNode.attribs['data-slug']
        if (slug) {
          return <ProductCardEmbed slug={slug} preloadedData={preloadedProducts[slug]} />
        }
      }

      // 2. Process TikTok embeds into clean iframes to avoid script unmounting bugs
      if (domNode instanceof Element && domNode.name === 'blockquote' && domNode.attribs.class?.includes('tiktok-embed')) {
        const videoId = domNode.attribs['data-video-id']
        // Fallback extraction if data-video-id is somehow missing but cite exists
        let finalId = videoId
        if (!finalId && domNode.attribs.cite) {
          const match = domNode.attribs.cite.match(/video\/(\d+)/)
          if (match) finalId = match[1]
        }
        
        if (finalId) {
          return (
            <div className="flex justify-center w-full my-10">
              <iframe 
                src={`https://www.tiktok.com/embed/v2/${finalId}`} 
                className="w-full max-w-[340px] aspect-[9/16] rounded-2xl shadow-lg border border-slate-100 bg-white"
                allow="encrypted-media;"
                title="TikTok video player"
              />
            </div>
          )
        }
      }

      // 3. Process generic scripts (Twitter, Instagram, etc)
      if (domNode instanceof Element && domNode.name === 'script' && domNode.attribs.src) {
        return <EmbeddedScript src={domNode.attribs.src} />
      }
    },
  })

  return <>{reactContent}</>
}
