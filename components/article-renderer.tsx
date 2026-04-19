import React from 'react'
import parse, { Element } from 'html-react-parser'
import { marked } from 'marked'
import { ProductCardEmbed, type ProductCardData } from './blocks/product-card-embed'

interface ArticleRendererProps {
  source: string
  preloadedProducts?: Record<string, ProductCardData>
}

function replaceProductShortcodes(source: string) {
  // Wrap in <div> so that marked.js (which runs with breaks:true) treats it as
  // a block-level element and does NOT wrap it inside a <p> tag.
  // A <product-embed> inside a <p> creates invalid HTML; browsers auto-correct
  // by splitting the <p>, which breaks the DOM and makes <a> links inside the
  // product card unclickable.
  return source.replace(
    /\[product-card:([^\]]+)\]/g,
    '<div><product-embed data-slug="$1"></product-embed></div>',
  )
}

export function compileArticleSourceToHtml(source: string) {
  const preparedSource = replaceProductShortcodes(source)
  return marked.parse(preparedSource, { async: false, breaks: true, gfm: true }) as string
}

import { EmbeddedScript } from './embedded-script'

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
                src={`https://www.tiktok.com/embed/v2/${finalId}?lang=en-US`} 
                className="w-full max-w-[325px] sm:max-w-[400px] border-none shadow-[0_4px_20px_rgba(0,0,0,0.08)] bg-white rounded-xl"
                style={{ height: '730px', minWidth: '325px' }}
                allowFullScreen
                scrolling="no"
                allow="encrypted-media"
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
