import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fgkvrbdpmwyfjvpubzxn.supabase.co'
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZna3ZyYmRwbXd5Zmp2cHVienhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNTExNjYsImV4cCI6MjA4MDgyNzE2Nn0.uc3OmHcbnzvvmsZfN8FcGWPvTbrQU9ofkyhH7Ykz0JE'

const BUCKET = 'article_images'

type ArticleRow = {
  slug: string
  title: string
  image_url: string | null
  image_alt: string | null
  image_title: string | null
}

function isArticleImagesPublicUrl(url: string) {
  try {
    const parsed = new URL(url)
    return parsed.pathname.includes(`/storage/v1/object/public/${BUCKET}/`)
  } catch {
    return false
  }
}

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  const { data: articles, error } = await supabase
    .from('articles')
    .select('slug, title, image_url, image_alt, image_title')
    .eq('published', true)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Could not fetch articles: ${error.message}`)
  }

  const skipped = ((articles || []) as ArticleRow[]).filter(
    (article) => article.image_url && !isArticleImagesPublicUrl(article.image_url),
  )

  console.log(`Skipped images outside ${BUCKET}: ${skipped.length}`)

  for (const article of skipped) {
    console.log('\n---')
    console.log(`slug: ${article.slug}`)
    console.log(`title: ${article.title}`)
    console.log(`image_url: ${article.image_url}`)
    console.log(`image_alt: ${article.image_alt || ''}`)
    console.log(`image_title: ${article.image_title || ''}`)
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
