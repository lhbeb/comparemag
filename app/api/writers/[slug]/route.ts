import { NextRequest, NextResponse } from 'next/server'
import { getWriterBySlug, updateWriter, deleteWriter } from '@/lib/supabase/writers'
import type { WriterUpdate } from '@/lib/supabase/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const writer = await getWriterBySlug(resolvedParams.slug)
    return NextResponse.json(writer, { status: 200 })
  } catch (error) {
    console.error('Error fetching writer:', error)
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Failed to fetch writer',
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
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

    const updateData: WriterUpdate = {}
    if (slug !== undefined) updateData.slug = slug
    if (name !== undefined) updateData.name = name
    if (specialty !== undefined) updateData.specialty = specialty
    if (bio !== undefined) updateData.bio = bio
    if (bio_html !== undefined) updateData.bio_html = bio_html
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url
    if (email !== undefined) updateData.email = email
    if (website !== undefined) updateData.website = website
    if (twitter_handle !== undefined) updateData.twitter_handle = twitter_handle
    if (linkedin_url !== undefined) updateData.linkedin_url = linkedin_url
    if (github_url !== undefined) updateData.github_url = github_url

    const writer = await updateWriter(resolvedParams.slug, updateData)

    return NextResponse.json(writer, { status: 200 })
  } catch (error) {
    console.error('Error updating writer:', error)
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Failed to update writer',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    await deleteWriter(resolvedParams.slug)
    return NextResponse.json({ message: 'Writer deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting writer:', error)
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Failed to delete writer',
      },
      { status: 500 }
    )
  }
}

import { restoreWriter } from '@/lib/supabase/writers'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const body = await request.json()
    
    if (body.action === 'restore') {
      await restoreWriter(resolvedParams.slug)
      return NextResponse.json({ message: 'Writer restored successfully' }, { status: 200 })
    }
    
    return NextResponse.json({ message: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error restoring writer:', error)
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Failed to restore writer',
      },
      { status: 500 }
    )
  }
}
