'use server'

import { createClient } from '@/lib/supabase/server'

export async function setFeaturedArticle(slug: string | null) {
  const supabase = await createClient()

  // First, unset all articles
  const { error: resetError } = await supabase
    .from('articles')
    .update({ is_featured: false })
    .neq('slug', 'random-invalid-string') // Supabase requires a filter for updates

  if (resetError) {
    throw new Error(`Failed to reset featured articles: ${resetError.message}`)
  }

  // If a slug was provided, set it as featured
  if (slug) {
    const { error: setError } = await supabase
      .from('articles')
      .update({ is_featured: true })
      .eq('slug', slug)

    if (setError) {
      throw new Error(`Failed to set featured article: ${setError.message}`)
    }
  }

  return { success: true }
}
