import { NextRequest, NextResponse } from 'next/server'
import { getAllArticles } from '@/lib/supabase/articles'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''
    
    if (!query || query.trim().length === 0) {
      return NextResponse.json({ articles: [] }, { status: 200 })
    }

    const articles = await getAllArticles(true) // Get only published articles
    
    // Smart search: search in title, content, category, and description
    const searchTerm = query.toLowerCase().trim()
    const filteredArticles = articles
      .filter((article) => {
        const title = article.title.toLowerCase()
        const content = article.content.replace(/<[^>]*>/g, '').toLowerCase()
        const category = article.category.toLowerCase()
        const description = article.meta_description?.toLowerCase() || ''
        
        return (
          title.includes(searchTerm) ||
          content.includes(searchTerm) ||
          category.includes(searchTerm) ||
          description.includes(searchTerm)
        )
      })
      .slice(0, 8) // Limit to 8 results for performance
    
    // Format articles for frontend
    const formattedArticles = filteredArticles.map((article) => ({
      slug: article.slug,
      title: article.title,
      description: article.content
        .replace(/<[^>]*>/g, '')
        .substring(0, 150)
        .trim() + '...',
      category: article.category,
      date: new Date(article.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      image: article.image_url || '/placeholder.svg',
    }))

    return NextResponse.json(
      { articles: formattedArticles, query: searchTerm },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('Error searching articles:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to search articles'
    return NextResponse.json(
      {
        message: errorMessage,
        error: true,
        articles: [],
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
}

