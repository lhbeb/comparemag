import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ image: null }, { status: 400 })
  }

  try {
    const res = await fetch(url, {
      headers: {
        // Pretend to be a browser so the page is fully served
        'User-Agent': 'Mozilla/5.0 (compatible; CompareMagBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) {
      return NextResponse.json({ image: null })
    }

    const html = await res.text()

    // Try og:image first
    const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)

    if (ogImageMatch?.[1]) {
      return NextResponse.json({ image: ogImageMatch[1] })
    }

    // Fallback: twitter:image
    const twImageMatch = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i)

    if (twImageMatch?.[1]) {
      return NextResponse.json({ image: twImageMatch[1] })
    }

    // Fallback: first large image tag
    const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*(?:width|height)=["'](?:[3-9]\d{2,}|\d{4,})["']/i)
    if (imgMatch?.[1]) {
      const imgSrc = imgMatch[1]
      const absolute = imgSrc.startsWith('http') ? imgSrc : new URL(imgSrc, url).toString()
      return NextResponse.json({ image: absolute })
    }

    return NextResponse.json({ image: null })
  } catch (err) {
    console.error('OG image fetch error:', err)
    return NextResponse.json({ image: null })
  }
}
