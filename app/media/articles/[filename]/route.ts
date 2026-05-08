import { NextRequest } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fgkvrbdpmwyfjvpubzxn.supabase.co'
const BUCKET = 'article_images'
const FOLDER = 'articles'
const CACHE_CONTROL = 'public, max-age=31536000, immutable'

function getSourceUrl(filename: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${FOLDER}/${encodeURIComponent(filename)}`
}

async function proxyArticleImage(filename: string, method: 'GET' | 'HEAD') {
  if (!filename || filename.includes('/') || filename.includes('\\')) {
    return new Response('Invalid image filename', { status: 400 })
  }

  const upstream = await fetch(getSourceUrl(filename), {
    method,
    headers: {
      Accept: 'image/*,*/*;q=0.8',
    },
    next: { revalidate: 31536000 },
  })

  if (!upstream.ok) {
    return new Response('Image not found', { status: upstream.status })
  }

  const headers = new Headers()
  headers.set('Cache-Control', CACHE_CONTROL)

  const contentType = upstream.headers.get('content-type')
  const contentLength = upstream.headers.get('content-length')
  const lastModified = upstream.headers.get('last-modified')
  const etag = upstream.headers.get('etag')

  if (contentType) headers.set('Content-Type', contentType)
  if (contentLength) headers.set('Content-Length', contentLength)
  if (lastModified) headers.set('Last-Modified', lastModified)
  if (etag) headers.set('ETag', etag)

  return new Response(method === 'HEAD' ? null : upstream.body, {
    status: 200,
    headers,
  })
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> | { filename: string } },
) {
  const { filename } = await Promise.resolve(params)
  return proxyArticleImage(filename, 'GET')
}

export async function HEAD(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> | { filename: string } },
) {
  const { filename } = await Promise.resolve(params)
  return proxyArticleImage(filename, 'HEAD')
}
