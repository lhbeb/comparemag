import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { compileArticleSourceToHtml } from '@/components/article-renderer'

function slugifyFilename(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'article'
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const supabase = await createClient()

    const { data: article, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', resolvedParams.slug)
      .single()

    if (error || !article) {
      return NextResponse.json(
        { message: 'Article not found.' },
        { status: 404 }
      )
    }

    const compiledHtml = compileArticleSourceToHtml(article.content || '')

    const exportPayload = {
      export_type: 'comparemag-article',
      export_version: 1,
      exported_at: new Date().toISOString(),
      article: {
        id: article.id,
        created_at: article.created_at,
        updated_at: article.updated_at,
        published_at: article.published_at,
        editor_settings: {
          originalSlug: article.slug,
          slug: article.slug,
          title: article.title,
          content: article.content,
          html_output: compiledHtml,
          author: article.author,
          category: article.category,
          image_url: article.image_url,
          read_time: article.read_time,
          published: article.published,
          article_type: article.article_type,
          generation_status: article.generation_status,
          listed_by: article.listed_by,
          meta_description: article.meta_description,
          meta_keywords: article.meta_keywords,
          focus_keyword: article.focus_keyword,
          og_title: article.og_title,
          og_description: article.og_description,
          og_image: article.og_image,
          canonical_url: article.canonical_url,
          twitter_card: article.twitter_card,
          is_featured: article.is_featured,
          programmatic_template: article.programmatic_template,
          programmatic_key: article.programmatic_key,
          programmatic_data: article.programmatic_data,
        },
      },
    }

    const filename = `${slugifyFilename(article.slug || article.title)}-export.json`

    return new NextResponse(JSON.stringify(exportPayload, null, 2), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : 'Failed to export article.',
      },
      { status: 500 }
    )
  }
}
