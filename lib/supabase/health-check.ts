import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fgkvrbdpmwyfjvpubzxn.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZna3ZyYmRwbXd5Zmp2cHVienhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNTExNjYsImV4cCI6MjA4MDgyNzE2Nn0.uc3OmHcbnzvvmsZfN8FcGWPvTbrQU9ofkyhH7Ykz0JE'

// We use anonymous key for simple read-only metadata checks 
// like checking table existence or row counting public tables.
const supabase = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy'
  database: {
    connected: boolean
    error?: string
  }
  storage: {
    accessible: boolean
    error?: string
  }
  tables: {
    articles: {
      exists: boolean
      rowCount?: number
      error?: string
    }
    writers: {
      exists: boolean
      rowCount?: number
      error?: string
    }
    product_cards: {
      exists: boolean
      rowCount?: number
      error?: string
    }
  }
  columns: {
    articles: {
      is_featured: boolean
      article_type: boolean
      canonical_url: boolean
      error?: string
    }
    writers: {
      specialty: boolean
      error?: string
    }
  }
  timestamp: string
}

export async function executeDatabaseHealthCheck(): Promise<HealthCheckResult> {
  const result: HealthCheckResult = {
    status: 'healthy',
    database: { connected: false },
    storage: { accessible: false },
    tables: {
      articles: { exists: false },
      writers: { exists: false },
      product_cards: { exists: false }
    },
    columns: {
      articles: {
        is_featured: false,
        article_type: false,
        canonical_url: false,
      },
      writers: {
        specialty: false,
      },
    },
    timestamp: new Date().toISOString(),
  }

  try {
    // Check articles table
    const { data: articles, error: dbError, count } = await supabase
      .from('articles')
      .select('id', { count: 'exact', head: true })

    if (dbError) {
      result.database.connected = false
      result.database.error = dbError.message
      result.status = 'unhealthy'
    } else {
      result.database.connected = true
      result.tables.articles.exists = true
      result.tables.articles.rowCount = count || 0

      const articleColumnChecks = await Promise.all([
        supabase.from('articles').select('is_featured', { head: true }).limit(1),
        supabase.from('articles').select('article_type', { head: true }).limit(1),
        supabase.from('articles').select('canonical_url', { head: true }).limit(1),
      ])

      result.columns.articles.is_featured = !articleColumnChecks[0].error
      result.columns.articles.article_type = !articleColumnChecks[1].error
      result.columns.articles.canonical_url = !articleColumnChecks[2].error

      const articleColumnErrors = articleColumnChecks
        .map((check) => check.error?.message)
        .filter(Boolean)

      if (articleColumnErrors.length > 0) {
        result.columns.articles.error = articleColumnErrors.join(' | ')
        result.status = 'unhealthy'
      }
    }

    // Check writers table
    if (result.database.connected) {
      const { error: writersError, count: writersCount } = await supabase
        .from('writers')
        .select('id', { count: 'exact', head: true })
        
      if (writersError) {
        result.tables.writers.error = writersError.message
        result.status = 'unhealthy'
      } else {
        result.tables.writers.exists = true
        result.tables.writers.rowCount = writersCount || 0

        const { error: specialtyError } = await supabase
          .from('writers')
          .select('specialty', { head: true })
          .limit(1)

        result.columns.writers.specialty = !specialtyError
        if (specialtyError) {
          result.columns.writers.error = specialtyError.message
          result.status = 'unhealthy'
        }
      }

      // Check product_cards table
      const { error: productsError, count: productsCount } = await supabase
        .from('product_cards')
        .select('id', { count: 'exact', head: true })
        
      if (productsError) {
        result.tables.product_cards.error = productsError.message
        result.status = 'unhealthy'
      } else {
        result.tables.product_cards.exists = true
        result.tables.product_cards.rowCount = productsCount || 0
      }
    }

    // Check storage bucket accessibility
    const { error: bucketError } = await supabase
      .storage
      .from('article_images')
      .list('', { limit: 1 })

    if (bucketError) {
      if (bucketError.message.includes('not found') || bucketError.message.includes('Bucket')) {
        result.storage.accessible = false
        result.storage.error = 'article_images bucket not found or not accessible'
        result.status = 'unhealthy'
      } else {
        result.storage.accessible = true
        result.storage.error = `Note: ${bucketError.message} (bucket exists but may have permission issues)`
      }
    } else {
      result.storage.accessible = true
    }
  } catch (error) {
    result.status = 'unhealthy'
    result.database.error = error instanceof Error ? error.message : 'Unknown error'
  }

  return result
}
