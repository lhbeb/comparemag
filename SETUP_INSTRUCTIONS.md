# Setup Instructions

## Step 1: Run Database Migration

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the entire contents of `lib/supabase/migrations.sql`
4. Paste it into the SQL Editor
5. Click **Run** to execute the migration

This will create:
- ✅ `articles` table with slug-based structure
- ✅ Indexes for performance
- ✅ Row Level Security (RLS) policies
- ✅ Storage policies

## Step 1.5: Create Storage Bucket (Manual Step)

The storage bucket needs to be created manually through the Supabase dashboard:

1. Go to **Supabase Dashboard** → **Storage**
2. Click **"New bucket"** button
3. Configure the bucket:
   - **Name**: `article_images`
   - **Public bucket**: ✅ Yes (check this box)
   - **File size limit**: 5MB (optional)
   - **Allowed MIME types**: image/jpeg, image/png, image/gif, image/webp (optional)
4. Click **"Create bucket"**

**Alternative**: You can also try running `scripts/create-storage-bucket.sql` in the SQL Editor, but manual creation is more reliable.

## Step 2: Verify Database Setup

Run the health check to verify everything is set up correctly:

```bash
npm run db:health
```

You should see:
- ✅ Database: Connected
- ✅ Storage: Accessible
- ✅ Tables: Articles exists

## Step 3: Migrate Existing Articles (Optional)

If you have existing articles in `lib/data/blogPosts.ts`, migrate them to Supabase:

```bash
npm run migrate:articles
```

This will push all 7 placeholder articles to your database.

## Troubleshooting

### Error: "cookies was called outside a request scope"

✅ **Fixed!** The health check script now uses a direct Supabase client.

### Error: "Table articles does not exist"

- Make sure you've run the SQL migration in Supabase SQL Editor
- Check that the migration completed without errors

### Error: "Permission denied" or RLS policy errors

The migration SQL includes policies that allow:
- Anonymous SELECT (for health checks and public viewing)
- Anonymous INSERT/UPDATE/DELETE (for admin operations)
- Anonymous storage uploads

If you still get permission errors:
1. Check that all policies were created successfully
2. Verify RLS is enabled: `ALTER TABLE articles ENABLE ROW LEVEL SECURITY;`
3. Check policy names match exactly

### Health Check Shows "Missing" Tables

1. Verify the migration ran successfully in Supabase
2. Check the Supabase dashboard → Table Editor → articles table exists
3. Try running the health check again: `npm run db:health`

## Next Steps

Once setup is complete:
1. ✅ Visit `/admin` to access the admin dashboard
2. ✅ Create new articles or edit existing ones
3. ✅ Upload images through the article editor
4. ✅ View articles on your blog
