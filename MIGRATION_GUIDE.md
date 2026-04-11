# Article Migration Guide

This guide explains how to migrate your existing articles from the static `blogPosts.ts` file to Supabase.

## Overview

The migration script (`scripts/migrate-articles-to-supabase.ts`) reads all articles from `lib/data/blogPosts.ts` and pushes them to your Supabase database.

## Prerequisites

1. ✅ Supabase database is set up (run `lib/supabase/migrations.sql`)
2. ✅ Database connection is working (run `npm run db:health`)

## Running the Migration

### Step 1: Verify Articles

Check that your articles exist in `lib/data/blogPosts.ts`:

```bash
# The file should contain articles like:
# - evolution-of-gans
# - multimodal-ai-models
# - ai-in-2025
# - deep-learning-nlp
# - future-of-ai-research
# - ethical-considerations-genai
# - ai-regulation-landscape-2025
```

### Step 2: Run the Migration

```bash
npm run migrate:articles
```

Or directly:

```bash
npx tsx scripts/migrate-articles-to-supabase.ts
```

### Step 3: Verify Results

The script will:
- ✅ Show progress for each article
- ⏭️  Skip articles that already exist (based on slug)
- ❌ Report any errors
- 📊 Display a summary at the end

## What the Script Does

1. **Reads articles** from `lib/data/blogPosts.ts`
2. **Checks for duplicates** by comparing slugs with existing articles
3. **Converts dates** from format like "May 15, 2023" to ISO timestamps
4. **Sets all articles as published** (published: true)
5. **Inserts articles** into Supabase with all metadata

## Article Mapping

The script maps fields as follows:

| blogPosts.ts | Supabase articles table |
|--------------|------------------------|
| slug | slug |
| title | title |
| content | content |
| author | author |
| category | category |
| image | image_url |
| readTime | read_time |
| date | published_at, created_at, updated_at |
| - | published (set to true) |

## Handling Duplicates

The script automatically skips articles that already exist in the database (based on slug). If you want to update existing articles, you'll need to:

1. Delete them from Supabase first, OR
2. Manually update them through the admin dashboard

## Troubleshooting

### Error: "Failed to fetch existing articles"

- Check your Supabase connection: `npm run db:health`
- Verify the database migration has been run
- Check that RLS policies allow SELECT operations

### Error: "Failed to insert article"

- Check that RLS policies allow INSERT operations
- Verify the article data is valid (no null required fields)
- Check for unique constraint violations (duplicate slugs)

### Articles not showing up

- Verify articles are marked as `published: true` in the database
- Check the admin dashboard at `/admin`
- Run `npm run db:health` to verify database connection

## After Migration

Once migration is complete:

1. ✅ Visit `/admin` to see all migrated articles
2. ✅ Check individual articles at `/blog/[slug]`
3. ✅ Verify articles appear on the homepage and articles page

## Re-running the Migration

The script is safe to run multiple times:
- It will skip articles that already exist
- Only new articles will be inserted
- No data will be overwritten

To force re-insertion, delete the articles from Supabase first, then run the migration again.
