import { NextResponse } from 'next/server'

import { replaceProductDomainsAcrossDatabase } from '@/lib/supabase/domain-replacement'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const fromDomain = typeof body?.fromDomain === 'string' ? body.fromDomain : ''
    const toDomain = typeof body?.toDomain === 'string' ? body.toDomain : ''

    if (!fromDomain.trim() || !toDomain.trim()) {
      return NextResponse.json(
        { error: 'Both source and target domains are required.' },
        { status: 400 },
      )
    }

    const result = await replaceProductDomainsAcrossDatabase({ fromDomain, toDomain })

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  } catch (error) {
    console.error('Domain replacement API error:', error)
    const message = error instanceof Error ? error.message : 'Failed to replace domains.'
    const status = /required|different/i.test(message) ? 400 : 500

    return NextResponse.json(
      { error: message },
      { status },
    )
  }
}
