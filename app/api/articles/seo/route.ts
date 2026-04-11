import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeArticleSEO } from '@/lib/seo/seo-analyzer'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug parameter is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: article, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    const analysis = analyzeArticleSEO(article)

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Error analyzing SEO:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to analyze SEO',
      },
      { status: 500 }
    )
  }
}

