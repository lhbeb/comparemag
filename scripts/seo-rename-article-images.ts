#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js'
import {
  addUniqueSuffix,
  buildArticleThumbnailAlt,
  buildArticleThumbnailFileName,
  getArticleYear,
  getImageExtension,
} from '../lib/seo/image-naming'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fgkvrbdpmwyfjvpubzxn.supabase.co'
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZna3ZyYmRwbXd5Zmp2cHVienhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNTExNjYsImV4cCI6MjA4MDgyNzE2Nn0.uc3OmHcbnzvvmsZfN8FcGWPvTbrQU9ofkyhH7Ykz0JE'

const BUCKET = 'article_images'
const dryRun = process.argv.includes('--dry-run')
const deleteOld = process.argv.includes('--delete-old')

type ArticleRow = {
  id: string
  slug: string
  title: string
  category: string
  image_url: string | null
  image_alt?: string | null
  image_title?: string | null
  created_at: string
  published_at: string | null
}

function getStoragePathFromPublicUrl(url: string) {
  try {
    const parsed = new URL(url)
    const marker = `/storage/v1/object/public/${BUCKET}/`
    const markerIndex = parsed.pathname.indexOf(marker)
    if (markerIndex === -1) return null
    return decodeURIComponent(parsed.pathname.slice(markerIndex + marker.length))
  } catch {
    return null
  }
}

function getPublicUrl(supabase: any, path: string) {
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, slug, title, category, image_url, image_alt, image_title, created_at, published_at')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Could not fetch articles: ${error.message}`)
  }

  let updated = 0
  let renamed = 0
  let skippedRename = 0
  let failed = 0

  for (const article of (articles || []) as ArticleRow[]) {
    const year = getArticleYear(article.published_at || article.created_at)
    const imageAlt = article.image_alt || buildArticleThumbnailAlt({
      title: article.title,
      category: article.category,
      year,
    })
    const extension = getImageExtension(article.image_url || 'image.webp', 'webp')
    const cleanFileName = buildArticleThumbnailFileName({
      title: article.title,
      category: article.category,
      year,
      extension,
    })
    const imageTitle = article.image_title || cleanFileName.replace(/\.[^.]+$/, '').replace(/-/g, ' ')

    let nextImageUrl = article.image_url
    const currentPath = article.image_url ? getStoragePathFromPublicUrl(article.image_url) : null

    try {
      if (currentPath) {
        const currentName = currentPath.split('/').pop() || ''
        const alreadySeoNamed = currentName.replace(/-\w+\.[^.]+$/, `.${extension}`) === cleanFileName

        if (!alreadySeoNamed) {
          const newPath = `articles/${addUniqueSuffix(cleanFileName)}`
          console.log(`${dryRun ? '[dry-run] ' : ''}Rename ${article.slug}: ${currentPath} -> ${newPath}`)

          if (!dryRun) {
            const { data: fileData, error: downloadError } = await supabase.storage.from(BUCKET).download(currentPath)
            if (downloadError || !fileData) {
              throw new Error(downloadError?.message || 'Download failed')
            }

            const { error: uploadError } = await supabase.storage.from(BUCKET).upload(newPath, fileData, {
              cacheControl: '31536000',
              upsert: false,
              contentType: fileData.type || undefined,
            })
            if (uploadError) throw new Error(uploadError.message)

            nextImageUrl = getPublicUrl(supabase, newPath)

            if (deleteOld) {
              await supabase.storage.from(BUCKET).remove([currentPath])
            }
          }
          renamed++
        } else {
          skippedRename++
        }
      } else if (article.image_url) {
        skippedRename++
        console.log(`Skip rename ${article.slug}: image is not in ${BUCKET} public storage`)
      }

      const updatePayload = {
        image_url: nextImageUrl,
        image_alt: imageAlt,
        image_title: imageTitle,
      }

      console.log(`${dryRun ? '[dry-run] ' : ''}Update metadata ${article.slug}: ${imageAlt}`)
      if (!dryRun) {
        const { error: updateError } = await supabase
          .from('articles')
          .update(updatePayload)
          .eq('id', article.id)

        if (updateError) throw new Error(updateError.message)
      }

      updated++
    } catch (error) {
      failed++
      console.error(`Failed ${article.slug}:`, error instanceof Error ? error.message : error)
    }
  }

  console.log('\nArticle image SEO migration summary')
  console.log(`Updated metadata: ${updated}`)
  console.log(`Renamed storage files: ${renamed}`)
  console.log(`Skipped renames: ${skippedRename}`)
  console.log(`Failed: ${failed}`)
  if (dryRun) console.log('\nDry run only. Re-run without --dry-run to apply changes.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
