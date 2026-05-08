import { NextRequest, NextResponse } from 'next/server'
import { submitIndexNowUrls } from '@/lib/indexnow'

function isAuthorized(request: NextRequest) {
  const token = process.env.INDEXNOW_SUBMIT_TOKEN

  if (!token) {
    return false
  }

  return request.headers.get('authorization') === `Bearer ${token}`
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { message: 'Unauthorized. Set INDEXNOW_SUBMIT_TOKEN and send it as a Bearer token.' },
      { status: 401 },
    )
  }

  try {
    const body = await request.json()
    const urls = Array.isArray(body?.urls) ? body.urls : body?.url ? [body.url] : []

    if (!urls.every((url: unknown) => typeof url === 'string')) {
      return NextResponse.json({ message: 'Expected "url" or "urls" as string values.' }, { status: 400 })
    }

    const result = await submitIndexNowUrls(urls)

    return NextResponse.json({
      message: result ? 'IndexNow submission completed.' : 'No URLs submitted.',
      result,
    })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'IndexNow submission failed.' },
      { status: 500 },
    )
  }
}
