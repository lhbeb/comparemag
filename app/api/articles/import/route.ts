import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createArticle, updateArticle } from '@/lib/supabase/articles'
import type { ArticleInsert, ArticleUpdate } from '@/lib/supabase/types'

type ImportedArticleSettings = {
  originalSlug?: string
  slug?: string
  title?: string
  content?: string
  html_output?: string
  author?: string
  category?: string
  image_url?: string | null
  read_time?: string
  published?: boolean
  article_type?: string | null
  generation_status?: string | null
  listed_by?: string | null
  meta_description?: string | null
  meta_keywords?: string | null
  focus_keyword?: string | null
  og_title?: string | null
  og_description?: string | null
  og_image?: string | null
  canonical_url?: string | null
  twitter_card?: string | null
  is_featured?: boolean | null
  programmatic_template?: string | null
  programmatic_key?: string | null
  programmatic_data?: unknown
  published_at?: string | null
}

function normalizeImportedSettings(payload: any): ImportedArticleSettings | null {
  if (!payload || typeof payload !== 'object') return null

  if (payload.export_type === 'comparemag-article' && payload.article?.editor_settings) {
    return {
      ...payload.article.editor_settings,
      published_at: payload.article.published_at ?? payload.article.editor_settings.published_at ?? null,
    }
  }

  if (payload.article?.editor_settings) {
    return payload.article.editor_settings
  }

  if (payload.editor_settings) {
    return payload.editor_settings
  }

  return payload
}

function buildArticlePayload(settings: ImportedArticleSettings): ArticleInsert {
  return {
    slug: settings.slug || '',
    title: settings.title || '',
    content: settings.content || '',
    author: settings.author || '',
    category: settings.category || '',
    image_url: settings.image_url || null,
    read_time: settings.read_time || '5 min read',
    published: Boolean(settings.published),
    published_at: settings.published ? settings.published_at || new Date().toISOString() : null,
    article_type: settings.article_type || 'manual',
    generation_status: settings.generation_status || 'draft',
    listed_by: settings.listed_by || null,
    meta_description: settings.meta_description || null,
    meta_keywords: settings.meta_keywords || null,
    focus_keyword: settings.focus_keyword || null,
    og_title: settings.og_title || null,
    og_description: settings.og_description || null,
    og_image: settings.og_image || null,
    canonical_url: settings.canonical_url || null,
    twitter_card: settings.twitter_card || null,
    is_featured: settings.is_featured ?? null,
    programmatic_template: settings.programmatic_template || null,
    programmatic_key: settings.programmatic_key || null,
    programmatic_data: settings.programmatic_data ?? null,
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    const settings = normalizeImportedSettings(payload)

    if (!settings) {
      return NextResponse.json(
        {
          message: 'Invalid article import file.',
          reason: 'The file does not match the CompareMag article export format.',
        },
        { status: 400 }
      )
    }

    if (payload?.export_type && payload.export_type !== 'comparemag-article') {
      return NextResponse.json(
        {
          message: 'Unsupported article export format.',
          reason: `Received export type "${payload.export_type}" instead of "comparemag-article".`,
        },
        { status: 400 }
      )
    }

    const articleData = buildArticlePayload(settings)

    if (!articleData.slug || !articleData.title || !articleData.content || !articleData.author || !articleData.category) {
      return NextResponse.json(
        {
          message: 'The import file is missing one or more required article fields.',
          reason: 'Required fields: slug, title, content, author, and category.',
        },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: existingArticle } = await supabase
      .from('articles')
      .select('slug')
      .eq('slug', articleData.slug)
      .maybeSingle()

    let result
    let action: 'created' | 'updated'

    if (existingArticle) {
      const updatePayload: ArticleUpdate = articleData
      result = await updateArticle(articleData.slug, updatePayload)
      action = 'updated'
    } else {
      result = await createArticle(articleData)
      action = 'created'
    }

    revalidatePath('/', 'layout')

    return NextResponse.json(
      {
        message: `Article ${action} successfully.`,
        action,
        slug: result.slug,
        title: result.title,
        reason: existingArticle
          ? `An existing article with slug "${result.slug}" was found, so it was updated.`
          : `No existing article with slug "${result.slug}" was found, so a new one was created.`,
      },
      { status: existingArticle ? 200 : 201 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : 'Failed to import article.',
        reason: 'The server could not finish importing the article.',
      },
      { status: 500 }
    )
  }
}
