# Admin Dashboard Setup Guide

This guide will help you set up the admin dashboard for your blog with Supabase integration.

## Prerequisites

1. A Supabase account and project
2. Node.js installed (v20+ recommended)
3. Environment variables configured

## Step 1: Set Up Supabase

### 1.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down your project URL and anon key from the project settings

### 1.2 Run Database Migrations

1. Open the Supabase SQL Editor
2. Copy and paste the contents of `lib/supabase/migrations.sql`
3. Run the migration to create:
   - `articles` table with slug-based structure
   - Storage bucket for article images
   - Row Level Security (RLS) policies
   - Indexes for performance

### 1.3 Configure Storage Bucket

The migration script creates a public bucket called `article_images`. Verify it exists in:
- Supabase Dashboard → Storage → Buckets

## Step 2: Configure Environment Variables

Create a `.env.local` file in the root of your project:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in:
- Supabase Dashboard → Project Settings → API

## Step 3: Test Database Connection

Run the health check tool to verify your setup:

```bash
npm run db:health
```

This will check:
- ✅ Database connection
- ✅ Storage bucket accessibility
- ✅ Articles table existence
- ✅ Row count

You can also check the health via API:
```bash
curl http://localhost:3000/api/health
```

## Step 4: Access Admin Dashboard

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the admin dashboard:
   ```
   http://localhost:3000/admin
   ```

## Step 5: Create Your First Article

1. Click "New Article" in the admin dashboard
2. Fill in the article details:
   - **Title**: Your article title
   - **Slug**: Auto-generated from title (you can edit it)
   - **Author**: Author name
   - **Category**: Select from dropdown
   - **Read Time**: Estimated reading time (e.g., "5 min read")
   - **Featured Image**: Upload an image or provide a URL
   - **Content**: Write your article content (HTML supported)

3. Click "Publish" to publish immediately, or "Save Draft" to save as draft

## Features

### Article Management
- ✅ Create new articles
- ✅ Edit existing articles
- ✅ Publish/unpublish articles
- ✅ View all articles (published and drafts)
- ✅ Image upload to Supabase storage

### Database Structure
- **Slug-based routing**: Articles are identified by unique slugs
- **Published status**: Control article visibility
- **Timestamps**: Automatic tracking of created/updated/published dates
- **Image storage**: Images stored in Supabase storage bucket

### Security
- Row Level Security (RLS) enabled
- Public read access for published articles only
- Authenticated users can create/edit/delete (configure as needed)

## API Endpoints

- `GET /api/articles/list` - Get all published articles
- `POST /api/articles` - Create a new article
- `PUT /api/articles/[slug]` - Update an article
- `DELETE /api/articles/[slug]` - Delete an article
- `GET /api/health` - Database health check

## Troubleshooting

### Database Connection Issues

1. Verify your environment variables are set correctly
2. Check that your Supabase project is active
3. Run the health check: `npm run db:health`

### Image Upload Issues

1. Verify the `article_images` bucket exists in Supabase
2. Check bucket policies allow uploads
3. Ensure images are under 5MB

### Article Not Showing

1. Check if the article is published (not just saved as draft)
2. Verify the slug is unique
3. Check browser console for errors

## Next Steps

- Configure authentication if you want to restrict admin access
- Customize RLS policies based on your needs
- Add related posts functionality
- Implement article search and filtering
