import { NextRequest, NextResponse } from 'next/server'
import { createArticle } from '@/lib/supabase/articles'
import type { ArticleInsert } from '@/lib/supabase/types'
import { revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
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
      listed_by,
    } = body

    // Validate required fields
    if (!slug || !title || !content || !author || !category) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    const articleData: ArticleInsert = {
      slug,
      title,
      content,
      author,
      category,
      image_url: image_url || null,
      read_time: read_time || '5 min read',
      published: published || false,
      published_at: published_at || null,
      article_type: article_type || 'manual',
      programmatic_template: programmatic_template || null,
      programmatic_key: programmatic_key || null,
      programmatic_data: programmatic_data || null,
      generation_status: generation_status || 'draft',
      meta_description: meta_description || null,
      meta_keywords: meta_keywords || null,
      focus_keyword: focus_keyword || null,
      og_title: og_title || null,
      og_description: og_description || null,
      og_image: og_image || null,
      twitter_card: twitter_card || null,
      canonical_url: canonical_url || null,
      listed_by: listed_by || null,
    }

    const article: any = await createArticle(articleData)

    revalidatePath('/', 'layout')

    return NextResponse.json(article, { status: 201 })
  } catch (error) {
    console.error('Error creating article:', error)
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : 'Failed to create article',
      },
      { status: 500 }
    )
  }
}
