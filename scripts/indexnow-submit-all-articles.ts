import { createClient } from '@supabase/supabase-js'
import { absoluteUrl } from '../lib/site-config'
import { submitIndexNowUrls } from '../lib/indexnow'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fgkvrbdpmwyfjvpubzxn.supabase.co'
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZna3ZyYmRwbXd5Zmp2cHVienhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNTExNjYsImV4cCI6MjA4MDgyNzE2Nn0.uc3OmHcbnzvvmsZfN8FcGWPvTbrQU9ofkyhH7Ykz0JE'

const BATCH_SIZE = 10000
const dryRun = process.argv.includes('--dry-run')

type ArticleRow = {
  slug: string
}

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  const { data: articles, error } = await supabase
    .from('articles')
    .select('slug')
    .eq('published', true)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Could not fetch published articles: ${error.message}`)
  }

  const urls = ((articles || []) as ArticleRow[])
    .map((article) => article.slug)
    .filter(Boolean)
    .map((slug) => absoluteUrl(`/blog/${slug}`))

  if (urls.length === 0) {
    console.log('No published article URLs found.')
    return
  }

  console.log(`${dryRun ? '[dry-run] ' : ''}Found ${urls.length} published article URLs.`)

  if (dryRun) {
    for (const url of urls) {
      console.log(`- ${url}`)
    }
    return
  }

  let submitted = 0

  for (let index = 0; index < urls.length; index += BATCH_SIZE) {
    const batch = urls.slice(index, index + BATCH_SIZE)
    const result = await submitIndexNowUrls(batch)

    if (!result?.ok) {
      throw new Error(
        `IndexNow batch failed: ${result?.status || 'unknown'} ${result?.statusText || ''} ${result?.responseText || ''}`.trim(),
      )
    }

    submitted += result.submittedUrls.length
    console.log(`Submitted ${submitted}/${urls.length} URLs.`)
  }

  console.log(`IndexNow submission complete: ${submitted} article URLs submitted.`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
