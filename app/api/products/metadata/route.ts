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

  return value
    .replace(/^Amazon\.[^:]+:\s*/i, '')
    .replace(/\s*[|\-]\s*Amazon\.[^|:-]+.*$/i, '')
    .trim() || null
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
    )

    const description = extractMetaContent(html, [
      /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["'][^>]*>/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["'][^>]*>/i,
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["'][^>]*>/i,
      /<meta[^>]+name=["']twitter:description["'][^>]+content=["']([^"']+)["'][^>]*>/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:description["'][^>]*>/i,
    ])

    const resolvedImage = image ? resolveUrl(image, response.url || targetUrl.toString()) : null

    if (!resolvedImage && !title && !description) {
      return NextResponse.json(
        { message: 'No useful metadata was found on that product page.' },
        { status: 404 },
      )
    }

    return NextResponse.json({
      image_url: resolvedImage ? normalizeMerchantImageUrl(resolvedImage) : null,
      title,
      description,
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
