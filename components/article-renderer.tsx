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

export function ArticleRenderer({ source, preloadedProducts = {} }: ArticleRendererProps) {
  const rawHtml = compileArticleSourceToHtml(source)

  const reactContent = parse(rawHtml, {
    replace: (domNode) => {
      if (domNode instanceof Element && domNode.name === 'product-embed') {
        const slug = domNode.attribs['data-slug']
        if (slug) {
          return <ProductCardEmbed slug={slug} preloadedData={preloadedProducts[slug]} />
        }
      }
    },
  })

  return <>{reactContent}</>
}
