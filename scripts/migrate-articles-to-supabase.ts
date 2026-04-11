#!/usr/bin/env tsx
/**
 * Migration Script: Push existing articles from blogPosts.ts to Supabase
 * 
 * This script reads all articles from the static blogPosts.ts file and
 * pushes them to your Supabase database.
 * 
 * Usage:
 *   npx tsx scripts/migrate-articles-to-supabase.ts
 * 
 * Or add to package.json:
 *   "scripts": {
 *     "migrate:articles": "tsx scripts/migrate-articles-to-supabase.ts"
 *   }
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { blogPosts } from '../lib/data/blogPosts'
import type { ArticleInsert } from '../lib/supabase/types'

// Direct Supabase client for migration script (no Next.js dependencies)
const SUPABASE_URL = 'https://fgkvrbdpmwyfjvpubzxn.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZna3ZyYmRwbXd5Zmp2cHVienhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNTExNjYsImV4cCI6MjA4MDgyNzE2Nn0.uc3OmHcbnzvvmsZfN8FcGWPvTbrQU9ofkyhH7Ykz0JE'

const supabase = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Helper function to parse date string like "May 15, 2023" to ISO string
function parseDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      // If parsing fails, use current date
      console.warn(`Failed to parse date "${dateString}", using current date`)
      return new Date().toISOString()
    }
    return date.toISOString()
  } catch (error) {
    console.warn(`Error parsing date "${dateString}":`, error)
    return new Date().toISOString()
  }
}

async function migrateArticles() {
  console.log('🚀 Starting article migration to Supabase...\n')

  try {
    // Get all existing articles to check for duplicates
    const { data: existingArticles, error: fetchError } = await supabase
      .from('articles')
      .select('slug')

    if (fetchError) {
      console.error('❌ Error fetching existing articles:', fetchError.message)
      process.exit(1)
    }

    const existingSlugs = new Set(existingArticles?.map((a) => a.slug) || [])
    console.log(`📊 Found ${existingSlugs.size} existing articles in database\n`)

    const articles = Object.entries(blogPosts)
    let successCount = 0
    let skipCount = 0
    let errorCount = 0

    console.log(`📝 Processing ${articles.length} articles from blogPosts.ts...\n`)

    for (const [slug, post] of articles) {
      // Skip if article already exists
      if (existingSlugs.has(slug)) {
        console.log(`⏭️  Skipping "${post.title}" (slug: ${slug}) - already exists`)
        skipCount++
        continue
      }

      try {
        const articleData: ArticleInsert = {
          slug,
          title: post.title,
          content: post.content.trim(),
          author: post.author,
          category: post.category,
          image_url: post.image || null,
          read_time: post.readTime,
          published: true, // Set all migrated articles as published
          published_at: parseDate(post.date),
          created_at: parseDate(post.date),
          updated_at: parseDate(post.date),
        }

        const { data, error } = await supabase
          .from('articles')
          .insert(articleData)
          .select()
          .single()

        if (error) {
          console.error(`❌ Error inserting "${post.title}":`, error.message)
          errorCount++
        } else {
          console.log(`✅ Migrated "${post.title}" (slug: ${slug})`)
          successCount++
        }
      } catch (error) {
        console.error(`❌ Unexpected error for "${post.title}":`, error)
        errorCount++
      }
    }

    console.log('\n' + '='.repeat(50))
    console.log('📊 Migration Summary:')
    console.log('='.repeat(50))
    console.log(`✅ Successfully migrated: ${successCount}`)
    console.log(`⏭️  Skipped (already exists): ${skipCount}`)
    console.log(`❌ Errors: ${errorCount}`)
    console.log(`📝 Total processed: ${articles.length}`)
    console.log('='.repeat(50))

    if (errorCount > 0) {
      console.log('\n⚠️  Some articles failed to migrate. Please check the errors above.')
      process.exit(1)
    } else {
      console.log('\n🎉 Migration completed successfully!')
      process.exit(0)
    }
  } catch (error) {
    console.error('❌ Fatal error during migration:', error)
    process.exit(1)
  }
}

// Run the migration
migrateArticles()
