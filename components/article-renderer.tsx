import React from 'react'
import parse, { Element } from 'html-react-parser'
import { marked } from 'marked'
import { ProductCardEmbed, type ProductCardData } from './blocks/product-card-embed'
import { LazyTikTokEmbed } from './lazy-tiktok-embed'
import { LazyTwitterEmbed } from './lazy-twitter-embed'

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
          return <LazyTikTokEmbed videoId={finalId} />
        }
      }

      // 2.5 Process Twitter embeds safely into clean containers 
      if (domNode instanceof Element && domNode.name === 'blockquote' && domNode.attribs.class?.includes('twitter-tweet')) {
        let tweetId = ''
        
        // Helper to recursively find the tweet ID in the child anchor tags
        const findTweetId = (node: any) => {
          if (node.name === 'a' && node.attribs?.href) {
            const match = node.attribs.href.match(/(?:twitter\.com|x\.com)\/[^/]+\/status\/(\d+)/)
            if (match) {
              tweetId = match[1]
              return true // stop searching
            }
          }
          if (node.children) {
            for (const child of node.children) {
              if (findTweetId(child)) return true
            }
          }
          return false
        }
        
        findTweetId(domNode)

        if (tweetId) {
          return <LazyTwitterEmbed tweetId={tweetId} />
        }
      }

      // 3. Process generic scripts (generic widgets, instagram, etc)
      if (domNode instanceof Element && domNode.name === 'script' && domNode.attribs.src) {
        const src = domNode.attribs.src

        // Twitter/X and TikTok are already converted into first-class React embeds
        // above. Running their original widget scripts as well causes duplicate
        // renders in preview/live output.
        if (
          /platform\.twitter\.com\/widgets\.js/i.test(src) ||
          /tiktok\.com/i.test(src)
        ) {
          return null
        }

        return <EmbeddedScript src={src} />
      }
    },
  })

  return <>{reactContent}</>
}
