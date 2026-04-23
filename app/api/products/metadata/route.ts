import { NextRequest, NextResponse } from 'next/server'
import { SITE_URL } from '@/lib/site-config'

function extractMetaContent(html: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = html.match(pattern)
    const value = match?.[1] || match?.[2]
    if (value) return value.trim()
  }

  return null
}

function normalizeMetadataTitle(value: string | null) {
  if (!value) return null

  const cleaned = value
    .replace(/^Amazon\.[^:]+:\s*/i, '')
    .replace(/\s*[|\-]\s*Amazon\.[^|:-]+.*$/i, '')
    .trim()

  if (!cleaned) return null
  if (/^amazon(?:\.com)?$/i.test(cleaned)) return null

  return cleaned
}

function normalizePriceText(price: string | null, currency?: string | null) {
  const rawPrice = (price || '').trim()
  if (!rawPrice) return null

  const cleanedPrice = rawPrice
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (/[$€£¥]/.test(cleanedPrice)) return cleanedPrice

  const normalizedCurrency = (currency || '').trim().toUpperCase()
  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: '$',
    AUD: '$',
    AED: 'AED ',
    MAD: 'MAD ',
  }

  const symbol = currencySymbols[normalizedCurrency]
  if (symbol) return `${symbol}${cleanedPrice}`

  return cleanedPrice
}

function titleCaseWords(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

function extractAmazonTitleFromPath(url: string) {
  try {
    const parsed = new URL(url)
    if (!parsed.hostname.includes('amazon.')) return null

    const segments = parsed.pathname.split('/').filter(Boolean)
    const beforeProductId = segments.find((segment) => segment.toLowerCase() !== 'dp' && !/^[A-Z0-9]{10}$/i.test(segment))
    if (!beforeProductId) return null

    const decoded = decodeURIComponent(beforeProductId).replace(/[-_]+/g, ' ').trim()
    if (!decoded || /^amazon$/i.test(decoded)) return null

    return titleCaseWords(decoded)
  } catch {
    return null
  }
}

function extractJsonLdBlocks(html: string) {
  const matches = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)
  return Array.from(matches, (match) => match[1]).filter(Boolean)
}

function findPriceInJsonLd(node: unknown): { price: string | null; currency: string | null } | null {
  if (!node) return null

  if (Array.isArray(node)) {
    for (const item of node) {
      const found = findPriceInJsonLd(item)
      if (found?.price) return found
    }
    return null
  }

  if (typeof node !== 'object') return null

  const record = node as Record<string, unknown>

  const directPrice = typeof record.price === 'string' || typeof record.price === 'number'
    ? String(record.price)
    : null
  const directCurrency = typeof record.priceCurrency === 'string'
    ? record.priceCurrency
    : null

  if (directPrice) {
    return { price: directPrice, currency: directCurrency }
  }

  if (record.offers) {
    const foundInOffers = findPriceInJsonLd(record.offers)
    if (foundInOffers?.price) return foundInOffers
  }

  for (const value of Object.values(record)) {
    const found = findPriceInJsonLd(value)
    if (found?.price) return found
  }

  return null
}

function extractStructuredDataPrice(html: string) {
  for (const block of extractJsonLdBlocks(html)) {
    try {
      const parsed = JSON.parse(block.trim())
      const found = findPriceInJsonLd(parsed)
      if (found?.price) return found
    } catch {
      continue
    }
  }

  return null
}

function extractRegexPrice(html: string) {
  let amazonDisplayPrice = null

  const priceWholeMatch = html.match(/<span[^>]*class=["'][^"']*a-price-whole[^"']*["'][^>]*>\s*([^<]+)\s*<\/span>\s*(?:<span[^>]*class=["'][^"']*a-price-decimal[^"']*["'][^>]*>\s*([^<]*)\s*<\/span>)?\s*<span[^>]*class=["'][^"']*a-price-fraction[^"']*["'][^>]*>\s*([^<]+)\s*<\/span>/i)
  if (priceWholeMatch) {
    amazonDisplayPrice = `${priceWholeMatch[1].replace(/[^\d.,]/g, '').trim()}.${priceWholeMatch[3].replace(/[^\d]/g, '').trim()}`
  }

  if (!amazonDisplayPrice) {
    const offscreenMatch = html.match(/<span[^>]*class=["'][^"']*a-offscreen[^"']*["'][^>]*>\s*([$€£¥]\s*\d[\d,.]*)\s*<\/span>/i)
    if (offscreenMatch) {
      amazonDisplayPrice = offscreenMatch[1]
    }
  }

  if (!amazonDisplayPrice) {
    const blockMatch = html.match(/<span[^>]*id=["']priceblock_(?:ourprice|dealprice)["'][^>]*>\s*([$€£¥]\s*\d[\d,.]*)\s*<\/span>/i)
    if (blockMatch) {
      amazonDisplayPrice = blockMatch[1]
    }
  }

  const price = amazonDisplayPrice || extractMetaContent(html, [
    /<meta[^>]+property=["']product:price:amount["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']product:price:amount["'][^>]*>/i,
    /<meta[^>]+property=["']og:price:amount["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:price:amount["'][^>]*>/i,
    /<meta[^>]+itemprop=["']price["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+itemprop=["']price["'][^>]*>/i,
    /"priceAmount"\s*:\s*"([^"]+)"/i,
    /"price"\s*:\s*"([0-9][^"]*)"/i,
    /"displayPrice"\s*:\s*"([^"]+)"/i,
  ])

  const currency = extractMetaContent(html, [
    /<meta[^>]+property=["']product:price:currency["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']product:price:currency["'][^>]*>/i,
    /<meta[^>]+property=["']og:price:currency["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:price:currency["'][^>]*>/i,
    /<meta[^>]+itemprop=["']priceCurrency["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+itemprop=["']priceCurrency["'][^>]*>/i,
    /"priceCurrency"\s*:\s*"([^"]+)"/i,
    /<span[^>]*class=["'][^"']*a-price-symbol[^"']*["'][^>]*>\s*([^<]+)\s*<\/span>/i,
  ])

  if (!price) return null

  return { price, currency }
}

function resolveUrl(candidate: string, baseUrl: string) {
  try {
    return new URL(candidate, baseUrl).toString()
  } catch {
    return null
  }
}

function normalizeMerchantImageUrl(url: string) {
  try {
    const parsed = new URL(url)
    const wrapped = parsed.searchParams.get('url')
    if (
      wrapped &&
      parsed.pathname.includes('/_next/image')
    ) {
      return new URL(wrapped, `${parsed.protocol}//${parsed.host}`).toString()
    }
    return parsed.toString()
  } catch {
    return url
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const rawUrl = typeof body?.url === 'string' ? body.url.trim() : ''

    if (!rawUrl) {
      return NextResponse.json({ message: 'Product URL is required.' }, { status: 400 })
    }

    let targetUrl: URL
    try {
      targetUrl = new URL(rawUrl)
    } catch {
      return NextResponse.json({ message: 'Please provide a valid absolute URL.' }, { status: 400 })
    }

    if (!['http:', 'https:'].includes(targetUrl.protocol)) {
      return NextResponse.json({ message: 'Only http/https URLs are supported.' }, { status: 400 })
    }

    const response = await fetch(targetUrl.toString(), {
      headers: {
        'user-agent':
          `Mozilla/5.0 (compatible; CompareMagBot/1.0; +${SITE_URL})`,
        accept: 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
      cache: 'no-store',
    })

    if (!response.ok) {
      return NextResponse.json(
        { message: `Could not fetch product page metadata (${response.status}).` },
        { status: 400 },
      )
    }

    const html = await response.text()

    const image = extractMetaContent(html, [
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["'][^>]*>/i,
      /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["'][^>]*>/i,
      /<meta[^>]+itemprop=["']image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+itemprop=["']image["'][^>]*>/i,
      /<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["'][^>]*>/i,
      /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']image_src["'][^>]*>/i,
    ])

    const title = normalizeMetadataTitle(
      extractMetaContent(html, [
        /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["'][^>]*>/i,
        /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["'][^>]*>/i,
        /<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["'][^>]*>/i,
        /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:title["'][^>]*>/i,
        /<meta[^>]+itemprop=["']name["'][^>]+content=["']([^"']+)["'][^>]*>/i,
        /<meta[^>]+content=["']([^"']+)["'][^>]+itemprop=["']name["'][^>]*>/i,
        /<title[^>]*>([^<]+)<\/title>/i,
      ]),
    ) || extractAmazonTitleFromPath(response.url || targetUrl.toString())

    const description = extractMetaContent(html, [
      /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["'][^>]*>/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["'][^>]*>/i,
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["'][^>]*>/i,
      /<meta[^>]+name=["']twitter:description["'][^>]+content=["']([^"']+)["'][^>]*>/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:description["'][^>]*>/i,
    ])

    const structuredPrice = extractStructuredDataPrice(html)
    const regexPrice = extractRegexPrice(html)
    const resolvedPriceText = normalizePriceText(
      structuredPrice?.price || regexPrice?.price || null,
      structuredPrice?.currency || regexPrice?.currency || null,
    )

    const resolvedImage = image ? resolveUrl(image, response.url || targetUrl.toString()) : null

    if (!resolvedImage && !title && !description && !resolvedPriceText) {
      return NextResponse.json(
        { message: 'No useful metadata was found on that product page.' },
        { status: 404 },
      )
    }

    return NextResponse.json({
      image_url: resolvedImage ? normalizeMerchantImageUrl(resolvedImage) : null,
      title,
      description,
      price_text: resolvedPriceText,
    }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : 'Failed to fetch product metadata.',
      },
      { status: 500 },
    )
  }
}
