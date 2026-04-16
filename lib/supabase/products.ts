import 'server-only'
import { createClient } from './server'
import type { ProductCard, ProductCardInsert, ProductCardUpdate } from './types'

export async function getAllProductsOverview(publishedOnly: boolean = false) {
  try {
    const supabase = await createClient()
    
    let query = supabase
      .from('product_cards')
      .select('id, slug, title, brand, price_text, rating_text, published, created_at, updated_at')
      .order('created_at', { ascending: false })

    if (publishedOnly) {
      query = query.eq('published', true)
    }

    const { data, error } = await query

    if (error) {
      console.error('Supabase error fetching products overview:', error)
      throw new Error(`Failed to fetch products overview: ${error.message}`)
    }

    return data as Partial<ProductCard>[]
  } catch (error) {
    if (error instanceof Error && error.message.includes('fetch failed')) {
      const { createClient: createDirectClient } = await import('@supabase/supabase-js')
      const directClient = createDirectClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fgkvrbdpmwyfjvpubzxn.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZna3ZyYmRwbXd5Zmp2cHVienhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNTExNjYsImV4cCI6MjA4MDgyNzE2Nn0.uc3OmHcbnzvvmsZfN8FcGWPvTbrQU9ofkyhH7Ykz0JE'
      )
      let query = directClient
        .from('product_cards')
        .select('id, slug, title, brand, price_text, rating_text, published, created_at, updated_at')
        .order('created_at', { ascending: false })

      if (publishedOnly) query = query.eq('published', true)
      
      const { data, error: retryError } = await query
      if (retryError) throw new Error(`Failed to fetch products overview: ${retryError.message}`)
      return data as Partial<ProductCard>[]
    }
    throw error
  }
}

export async function getAllProducts(publishedOnly: boolean = false) {
  try {
    const supabase = await createClient()
    
    let query = supabase
      .from('product_cards')
      .select('*')
      .order('created_at', { ascending: false })

    if (publishedOnly) {
      query = query.eq('published', true)
    }

    const { data, error } = await query

    if (error) {
      console.error('Supabase error fetching products:', error)
      throw new Error(`Failed to fetch products: ${error.message}`)
    }

    return data as ProductCard[]
  } catch (error) {
    console.error('Error in getAllProducts:', error)
    if (error instanceof Error && error.message.includes('fetch failed')) {
      const { createClient: createDirectClient } = await import('@supabase/supabase-js')
      const directClient = createDirectClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fgkvrbdpmwyfjvpubzxn.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZna3ZyYmRwbXd5Zmp2cHVienhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNTExNjYsImV4cCI6MjA4MDgyNzE2Nn0.uc3OmHcbnzvvmsZfN8FcGWPvTbrQU9ofkyhH7Ykz0JE'
      )
      let query = directClient
        .from('product_cards')
        .select('*')
        .order('created_at', { ascending: false })

      if (publishedOnly) {
        query = query.eq('published', true)
      }
      
      const { data, error: retryError } = await query
      if (retryError) throw new Error(`Failed to fetch products: ${retryError.message}`)
      return data as ProductCard[]
    }
    throw error
  }
}

export async function getProductBySlug(slug: string) {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('product_cards')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw new Error(`Failed to fetch product: ${error.message}`)
    }

    return data as ProductCard
  } catch (error) {
    if (error instanceof Error && error.message.includes('fetch failed')) {
      const { createClient: createDirectClient } = await import('@supabase/supabase-js')
      const directClient = createDirectClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fgkvrbdpmwyfjvpubzxn.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZna3ZyYmRwbXd5Zmp2cHVienhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNTExNjYsImV4cCI6MjA4MDgyNzE2Nn0.uc3OmHcbnzvvmsZfN8FcGWPvTbrQU9ofkyhH7Ykz0JE'
      )
      const { data, error: retryError } = await directClient
        .from('product_cards')
        .select('*')
        .eq('slug', slug)
        .single()
        
      if (retryError) {
        if (retryError.code === 'PGRST116') return null
        throw new Error(`Failed to fetch product: ${retryError.message}`)
      }
      return data as ProductCard
    }
    throw error
  }
}

export async function createProduct(product: ProductCardInsert) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('product_cards')
    .insert(product)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create product card: ${error.message}`)
  }

  return data as ProductCard
}

export async function updateProduct(slug: string, updates: ProductCardUpdate) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('product_cards')
    .update(updates)
    .eq('slug', slug)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update product card: ${error.message}`)
  }

  return data as ProductCard
}

export async function deleteProduct(slug: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('product_cards')
    .delete()
    .eq('slug', slug)

  if (error) {
    throw new Error(`Failed to delete product card: ${error.message}`)
  }
}
