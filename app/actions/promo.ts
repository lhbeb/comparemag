'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

function isMissingFeaturedColumn(message: string) {
  return message.includes('column articles.is_featured does not exist')
}

export async function setFeaturedArticle(slug: string | null) {
  const supabase = await createClient()

  // First, unset all articles
  const { error: resetError } = await supabase
    .from('articles')
    .update({ is_featured: false })
    .neq('slug', 'random-invalid-string') // Supabase requires a filter for updates

  if (resetError) {
    if (isMissingFeaturedColumn(resetError.message)) {
      throw new Error('Promo Bar is not enabled in Supabase yet. Run the promo-bar migration to add the is_featured column.')
    }
    throw new Error(`Failed to reset featured articles: ${resetError.message}`)
  }

  // If a slug was provided, set it as featured
  if (slug) {
    const { error: setError } = await supabase
      .from('articles')
      .update({ is_featured: true })
      .eq('slug', slug)

    if (setError) {
      if (isMissingFeaturedColumn(setError.message)) {
        throw new Error('Promo Bar is not enabled in Supabase yet. Run the promo-bar migration to add the is_featured column.')
      }
      throw new Error(`Failed to set featured article: ${setError.message}`)
    }
  }

  // Refresh the public-site chrome so the promo bar updates without waiting for a rebuild/redeploy.
  revalidatePath('/', 'layout')
  revalidatePath('/')
  revalidatePath('/articles')
  revalidatePath('/topics')
  revalidatePath('/writers')

  return { success: true }
}
