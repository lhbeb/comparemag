#!/usr/bin/env tsx
/**
 * Script to update all articles to have the author "Angelina Bianca De Leon"
 * 
 * Usage: npx tsx scripts/update-all-authors.ts
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://fgkvrbdpmwyfjvpubzxn.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZna3ZyYmRwbXd5Zmp2cHVienhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNTExNjYsImV4cCI6MjA4MDgyNzE2Nn0.uc3OmHcbnzvvmsZfN8FcGWPvTbrQU9ofkyhH7Ykz0JE'

const AUTHOR_NAME = 'Angelina Bianca De Leon'

async function updateAllAuthors() {
  console.log('🔧 Starting author update process...\n')

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  try {
    // First, get all articles
    console.log('📖 Fetching all articles...')
    const { data: articles, error: fetchError } = await supabase
      .from('articles')
      .select('id, slug, title, author')

    if (fetchError) {
      throw new Error(`Failed to fetch articles: ${fetchError.message}`)
    }

    if (!articles || articles.length === 0) {
      console.log('ℹ️  No articles found in the database.')
      return
    }

    console.log(`✅ Found ${articles.length} article(s)\n`)

    // Filter articles that need updating
    const articlesToUpdate = articles.filter(
      (article) => article.author !== AUTHOR_NAME
    )

    if (articlesToUpdate.length === 0) {
      console.log('✅ All articles already have the correct author!')
      return
    }

    console.log(`📝 Updating ${articlesToUpdate.length} article(s)...\n`)

    // Update each article
    let successCount = 0
    let errorCount = 0

    for (const article of articlesToUpdate) {
      console.log(`  Updating: "${article.title}" (${article.slug})`)
      console.log(`    Old author: ${article.author}`)
      console.log(`    New author: ${AUTHOR_NAME}`)

      const { error: updateError } = await supabase
        .from('articles')
        .update({ author: AUTHOR_NAME })
        .eq('id', article.id)

      if (updateError) {
        console.error(`    ❌ Error: ${updateError.message}`)
        errorCount++
      } else {
        console.log(`    ✅ Updated successfully\n`)
        successCount++
      }
    }

    console.log('\n📊 Summary:')
    console.log(`  ✅ Successfully updated: ${successCount}`)
    if (errorCount > 0) {
      console.log(`  ❌ Errors: ${errorCount}`)
    }
    console.log(`\n✨ All articles now have author: "${AUTHOR_NAME}"`)
  } catch (error) {
    console.error('\n❌ Error updating authors:', error)
    process.exit(1)
  }
}

// Run the script
updateAllAuthors()
  .then(() => {
    console.log('\n🎉 Script completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error)
    process.exit(1)
  })

