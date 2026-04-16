import { NextRequest, NextResponse } from 'next/server'
import { createWriter, getAllWriters } from '@/lib/supabase/writers'
import type { WriterInsert } from '@/lib/supabase/types'

export async function GET() {
  try {
    const writers = await getAllWriters()
    return NextResponse.json(writers, { status: 200 })
  } catch (error) {
    console.error('Error fetching writers:', error)
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Failed to fetch writers',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      slug,
      name,
      specialty,
      bio,
      bio_html,
      avatar_url,
      email,
      website,
      twitter_handle,
      linkedin_url,
      github_url,
    } = body

    // Validate required fields
    if (!slug || !name) {
      return NextResponse.json(
        { message: 'Missing required fields: slug and name are required' },
        { status: 400 }
      )
    }

    const writerData: WriterInsert = {
      slug,
      name,
      specialty: specialty || null,
      bio: bio || null,
      bio_html: bio_html || null,
      avatar_url: avatar_url || null,
      email: email || null,
      website: website || null,
      twitter_handle: twitter_handle || null,
      linkedin_url: linkedin_url || null,
      github_url: github_url || null,
    }

    const writer = await createWriter(writerData)

    return NextResponse.json(writer, { status: 201 })
  } catch (error) {
    console.error('Error creating writer:', error)
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : 'Failed to create writer',
      },
      { status: 500 }
    )
  }
}
