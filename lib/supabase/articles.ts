import 'server-only'
import { createClient } from './server'
import type { Article, ArticleInsert, ArticleUpdate } from './types'

function getMissingColumnName(message: string) {
  const match = message.match(/Could not find the '([^']+)' column/)
  return match?.[1] ?? null
}

async function retryWithoutMissingColumns<T extends Record<string, unknown>>(
  operation: (payload: T) => PromiseLike<{ data: unknown; error: { message: string } | null }>,
  payload: T,
) {
  let nextPayload = { ...payload }

  while (true) {
    const result = await operation(nextPayload)

    if (!result.error) {
      return result.data
    }

    const missingColumn = getMissingColumnName(result.error.message)
    if (!missingColumn || !(missingColumn in nextPayload)) {
      throw new Error(result.error.message)
    }

    const { [missingColumn]: _removed, ...rest } = nextPayload
    nextPayload = rest as T
  }
}

export async function getAllArticlesOverview(publishedOnly: boolean = false) {
  try {
    const supabase = await createClient()
    
    let query = supabase
      .from('articles')
      .select('id, slug, title, category, author, image_url, published, article_type, updated_at, created_at, is_featured')
      .order('created_at', { ascending: false })

    if (publishedOnly) {
      query = query.eq('published', true)
    }

    const { data, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      throw new Error(`Failed to fetch articles overview: ${error.message}`)
    }

    return data as Partial<Article>[]
  } catch (error) {
    if (error instanceof Error && error.message.includes('fetch failed')) {
      const { createClient: createDirectClient } = await import('@supabase/supabase-js')
      const directClient = createDirectClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fgkvrbdpmwyfjvpubzxn.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZna3ZyYmRwbXd5Zmp2cHVienhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNTExNjYsImV4cCI6MjA4MDgyNzE2Nn0.uc3OmHcbnzvvmsZfN8FcGWPvTbrQU9ofkyhH7Ykz0JE'
      )
      let query = directClient
        .from('articles')
        .select('id, slug, title, category, author, image_url, published, article_type, updated_at, created_at, is_featured')
        .order('created_at', { ascending: false })

      if (publishedOnly) query = query.eq('published', true)
      
      const { data, error: retryError } = await query
      if (retryError) throw new Error(`Failed to fetch articles overview: ${retryError.message}`)
      return data as Partial<Article>[]
    }
    throw error
  }
}

export async function getAllArticles(publishedOnly: boolean = true) {
  try {
    const supabase = await createClient()
    
    let query = supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false })

    if (publishedOnly) {
      query = query.eq('published', true)
    }

    const { data, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      throw new Error(`Failed to fetch articles: ${error.message}`)
    }

    return data as Article[]
  } catch (error) {
    console.error('Error in getAllArticles:', error)
    // If it's a network error, try one more time with a direct client
    if (error instanceof Error && error.message.includes('fetch failed')) {
      try {
        const { createClient: createDirectClient } = await import('@supabase/supabase-js')
        const directClient = createDirectClient(
          'https://fgkvrbdpmwyfjvpubzxn.supabase.co',
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZna3ZyYmRwbXd5Zmp2cHVienhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNTExNjYsImV4cCI6MjA4MDgyNzE2Nn0.uc3OmHcbnzvvmsZfN8FcGWPvTbrQU9ofkyhH7Ykz0JE'
        )
        
        let query = directClient
          .from('articles')
          .select('*')
          .order('created_at', { ascending: false })

        if (publishedOnly) {
          query = query.eq('published', true)
        }

        const { data, error: retryError } = await query

        if (retryError) {
          throw new Error(`Failed to fetch articles: ${retryError.message}`)
        }

        return data as Article[]
      } catch (retryError) {
        console.error('Retry also failed:', retryError)
        throw error // Throw original error
      }
    }
    throw error
  }
}

export async function getArticleBySlug(slug: string) {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Article not found
      }
      console.error('Supabase error:', error)
      throw new Error(`Failed to fetch article: ${error.message}`)
    }

    return data as Article
  } catch (error) {
    console.error('Error in getArticleBySlug:', error)
    // If it's a network error, try one more time with a direct client
    if (error instanceof Error && error.message.includes('fetch failed')) {
      try {
        const { createClient: createDirectClient } = await import('@supabase/supabase-js')
        const directClient = createDirectClient(
          'https://fgkvrbdpmwyfjvpubzxn.supabase.co',
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZna3ZyYmRwbXd5Zmp2cHVienhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNTExNjYsImV4cCI6MjA4MDgyNzE2Nn0.uc3OmHcbnzvvmsZfN8FcGWPvTbrQU9ofkyhH7Ykz0JE'
        )
        
        const { data, error: retryError } = await directClient
          .from('articles')
          .select('*')
          .eq('slug', slug)
          .eq('published', true)
          .single()

        if (retryError) {
          if (retryError.code === 'PGRST116') {
            return null // Article not found
          }
          throw new Error(`Failed to fetch article: ${retryError.message}`)
        }

        return data as Article
      } catch (retryError) {
        console.error('Retry also failed:', retryError)
        throw error // Throw original error
      }
    }
    throw error
  }
}

export async function getAllSlugs() {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('articles')
      .select('slug')
      .eq('published', true)

    if (error) {
      console.error('Supabase error:', error)
      throw new Error(`Failed to fetch slugs: ${error.message}`)
    }

    return data.map((item) => item.slug)
  } catch (error) {
    console.error('Error in getAllSlugs:', error)
    // If it's a network error, try one more time with a direct client
    if (error instanceof Error && error.message.includes('fetch failed')) {
      try {
        const { createClient: createDirectClient } = await import('@supabase/supabase-js')
        const directClient = createDirectClient(
          'https://fgkvrbdpmwyfjvpubzxn.supabase.co',
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZna3ZyYmRwbXd5Zmp2cHVienhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNTExNjYsImV4cCI6MjA4MDgyNzE2Nn0.uc3OmHcbnzvvmsZfN8FcGWPvTbrQU9ofkyhH7Ykz0JE'
        )
        
        const { data, error: retryError } = await directClient
          .from('articles')
          .select('slug')
          .eq('published', true)

        if (retryError) {
          throw new Error(`Failed to fetch slugs: ${retryError.message}`)
        }

        return data.map((item) => item.slug)
      } catch (retryError) {
        console.error('Retry also failed:', retryError)
        // Return empty array to prevent build failures
        return []
      }
    }
    // Return empty array to prevent build failures
    return []
  }
}

export async function createArticle(article: ArticleInsert) {
  const supabase = await createClient()

  const data = await retryWithoutMissingColumns(
    (payload) =>
      supabase
        .from('articles')
        .insert(payload)
        .select()
        .single(),
    article as Record<string, unknown>,
  )

  return data as Article
}

export async function updateArticle(slug: string, updates: ArticleUpdate) {
  const supabase = await createClient()

  const data = await retryWithoutMissingColumns(
    (payload) =>
      supabase
        .from('articles')
        .update(payload)
        .eq('slug', slug)
        .select()
        .single(),
    updates as Record<string, unknown>,
  )

  return data as Article
}

export async function deleteArticle(slug: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('articles')
    .delete()
    .eq('slug', slug)

  if (error) {
    throw new Error(`Failed to delete article: ${error.message}`)
  }
}

export async function publishArticle(slug: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('articles')
    .update({ 
      published: true,
      published_at: new Date().toISOString()
    })
    .eq('slug', slug)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to publish article: ${error.message}`)
  }

  return data as Article
}

export async function unpublishArticle(slug: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('articles')
    .update({ 
      published: false,
      published_at: null
    })
    .eq('slug', slug)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to unpublish article: ${error.message}`)
  }

  return data as Article
}
