import React from 'react';
import parse, { DOMNode, Element, attributesToProps } from 'html-react-parser';
import { marked } from 'marked';
import { ProductCardEmbed, type ProductCardData } from './blocks/product-card-embed';

interface ArticleRendererProps {
  source: string;
  preloadedProducts?: Record<string, ProductCardData>;
}

export function ArticleRenderer({ source, preloadedProducts = {} }: ArticleRendererProps) {
  // 1. Convert Markdown to HTML string
  // Replace shortcode [product-card:slug] with a virtual tag <product-embed data-slug="slug">
  const preparedSource = source.replace(/\[product-card:([^\]]+)\]/g, '<product-embed data-slug="$1"></product-embed>');
  
  const rawHtml = marked.parse(preparedSource, { async: false }) as string;

  // 2. Parse HTML string to React components, intercepting custom tags
  const reactContent = parse(rawHtml, {
    replace: (domNode) => {
      if (domNode instanceof Element && domNode.name === 'product-embed') {
        const slug = domNode.attribs['data-slug'];
        if (slug) {
          return <ProductCardEmbed slug={slug} preloadedData={preloadedProducts[slug]} />;
        }
      }
    }
  });

  return <>{reactContent}</>;
}
