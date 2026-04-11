import { NextResponse } from 'next/server'
import { getAllArticles } from '@/lib/supabase/articles'

export const revalidate = 60 // Revalidate every 60 seconds for better performance

export async function GET() {
  try {
    const articles = await getAllArticles(true) // Get only published articles
    
    // Format articles for frontend
    const formattedArticles = articles.map((article) => ({
      slug: article.slug,
      title: article.title,
      description: article.content
        .replace(/<[^>]*>/g, '')
        .substring(0, 200)
        .trim() + '...',
      category: article.category,
      date: new Date(article.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      image: article.image_url || '/placeholder.svg',
    }))

    return NextResponse.json(formattedArticles, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    })
  } catch (error) {
    console.error('Error fetching articles:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch articles'
    return NextResponse.json(
      { 
        message: errorMessage,
        error: true,
        articles: [] // Return empty array on error
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
