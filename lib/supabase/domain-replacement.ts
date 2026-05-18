import 'server-only'

import { createClient } from './server'

export interface DomainReplacementSummary {
  fromDomain: string
  toDomain: string
  updatedProductCount: number
  updatedArticleCount: number
  updatedProductSlugs: string[]
  updatedArticleSlugs: string[]
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function normalizeDomain(value: string) {
  const trimmed = value.trim().toLowerCase()

  if (!trimmed) return ''

  return trimmed
    .replace(/^[a-z][a-z0-9+.-]*:\/\//i, '')
    .replace(/^\/\//, '')
    .split('/')[0]
    .split('?')[0]
    .split('#')[0]
    .replace(/^www\./, '')
}

export function replaceDomainOccurrences(value: string, fromDomain: string, toDomain: string) {
  const normalizedFrom = normalizeDomain(fromDomain)
  const normalizedTo = normalizeDomain(toDomain)

  if (!value || !normalizedFrom || !normalizedTo || normalizedFrom === normalizedTo) {
    return value
  }

  const domainPattern = new RegExp(
    `(?<![a-z0-9-])${escapeRegExp(normalizedFrom)}(?![a-z0-9-])`,
    'gi',
  )

  return value.replace(domainPattern, normalizedTo)
}

export async function replaceProductDomainsAcrossDatabase(input: {
  fromDomain: string
  toDomain: string
}): Promise<DomainReplacementSummary> {
  const fromDomain = normalizeDomain(input.fromDomain)
  const toDomain = normalizeDomain(input.toDomain)

  if (!fromDomain || !toDomain) {
    throw new Error('Both source and target domains are required.')
  }

  if (fromDomain === toDomain) {
    throw new Error('The source and target domains must be different.')
  }

  const supabase = await createClient()

  const { data: products, error: productsError } = await supabase
    .from('product_cards')
    .select('id, slug, external_url')
    .ilike('external_url', `%${fromDomain}%`)

  if (productsError) {
    throw new Error(`Failed to load product cards: ${productsError.message}`)
  }

  const updatedProductSlugs: string[] = []

  for (const product of products || []) {
    const nextExternalUrl = replaceDomainOccurrences(product.external_url || '', fromDomain, toDomain)

    if (!nextExternalUrl || nextExternalUrl === product.external_url) continue

    const { error } = await supabase
      .from('product_cards')
      .update({ external_url: nextExternalUrl })
      .eq('id', product.id)

    if (error) {
      throw new Error(`Failed to update product "${product.slug}": ${error.message}`)
    }

    updatedProductSlugs.push(product.slug)
  }

  const { data: articles, error: articlesError } = await supabase
    .from('articles')
    .select('id, slug, content')
    .ilike('content', `%${fromDomain}%`)

  if (articlesError) {
    throw new Error(`Failed to load articles: ${articlesError.message}`)
  }

  const updatedArticleSlugs: string[] = []

  for (const article of articles || []) {
    const nextContent = replaceDomainOccurrences(article.content || '', fromDomain, toDomain)

    if (!nextContent || nextContent === article.content) continue

    const { error } = await supabase
      .from('articles')
      .update({ content: nextContent })
      .eq('id', article.id)

    if (error) {
      throw new Error(`Failed to update article "${article.slug}": ${error.message}`)
    }

    updatedArticleSlugs.push(article.slug)
  }

  return {
    fromDomain,
    toDomain,
    updatedProductCount: updatedProductSlugs.length,
    updatedArticleCount: updatedArticleSlugs.length,
    updatedProductSlugs,
    updatedArticleSlugs,
  }
}
