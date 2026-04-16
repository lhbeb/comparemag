import { NextRequest, NextResponse } from 'next/server'
import { updateArticle, deleteArticle } from '@/lib/supabase/articles'
import type { ArticleUpdate } from '@/lib/supabase/types'
import { revalidatePath } from 'next/cache'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const body = await request.json()
    const {
      slug,
      title,
      content,
      author,
      category,
      image_url,
      read_time,
      published,
      published_at,
      article_type,
      programmatic_template,
      programmatic_key,
      programmatic_data,
      generation_status,
      meta_description,
      meta_keywords,
      focus_keyword,
      og_title,
      og_description,
      og_image,
      twitter_card,
      canonical_url,
    } = body

    const updateData: ArticleUpdate = {}

    if (slug !== undefined) updateData.slug = slug
    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content
    if (author !== undefined) updateData.author = author
    if (category !== undefined) updateData.category = category
    if (image_url !== undefined) updateData.image_url = image_url
    if (read_time !== undefined) updateData.read_time = read_time
    if (published !== undefined) updateData.published = published
    if (published_at !== undefined) updateData.published_at = published_at
    if (article_type !== undefined) updateData.article_type = article_type
    if (programmatic_template !== undefined) updateData.programmatic_template = programmatic_template
    if (programmatic_key !== undefined) updateData.programmatic_key = programmatic_key
    if (programmatic_data !== undefined) updateData.programmatic_data = programmatic_data
    if (generation_status !== undefined) updateData.generation_status = generation_status
    
    // SEO fields
    if (meta_description !== undefined) updateData.meta_description = meta_description
    if (meta_keywords !== undefined) updateData.meta_keywords = meta_keywords
    if (focus_keyword !== undefined) updateData.focus_keyword = focus_keyword
    if (og_title !== undefined) updateData.og_title = og_title
    if (og_description !== undefined) updateData.og_description = og_description
    if (og_image !== undefined) updateData.og_image = og_image
    if (twitter_card !== undefined) updateData.twitter_card = twitter_card
    if (canonical_url !== undefined) updateData.canonical_url = canonical_url

    const article = await updateArticle(resolvedParams.slug, updateData)

    revalidatePath('/', 'layout')

    return NextResponse.json(article)
  } catch (error) {
    console.error('Error updating article:', error)
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : 'Failed to update article',
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
    await deleteArticle(resolvedParams.slug)

    revalidatePath('/', 'layout')

    return NextResponse.json({ message: 'Article deleted successfully' })
  } catch (error) {
    console.error('Error deleting article:', error)
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : 'Failed to delete article',
      },
      { status: 500 }
    )
  }
}
