# Admin Dashboard

## Quick Start

1. **Set up Supabase**:
   - Create a project at [supabase.com](https://supabase.com)
   - Run the SQL migration from `lib/supabase/migrations.sql` in the Supabase SQL Editor
   - Get your project URL and anon key

2. **Configure environment**:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

3. **Test connection**:
   ```bash
   npm run db:health
   ```

4. **Start development**:
   ```bash
   npm run dev
   ```

5. **Access admin**:
   - Navigate to `http://localhost:3000/admin`

## Database Schema

The `articles` table uses a slug-based structure:

```sql
articles
├── id (UUID, primary key)
├── slug (TEXT, unique, indexed)
├── title (TEXT)
├── content (TEXT, HTML)
├── author (TEXT)
├── category (TEXT)
├── image_url (TEXT, nullable)
├── read_time (TEXT)
├── published (BOOLEAN)
├── created_at (TIMESTAMPTZ)
├── updated_at (TIMESTAMPTZ)
└── published_at (TIMESTAMPTZ, nullable)
```

## Storage

Images are stored in the `article_images` bucket:
- Public read access
- Authenticated upload access
- Max file size: 5MB (enforced in frontend)

## Health Check

Check database health:
```bash
npm run db:health
```

Or via API:
```bash
curl http://localhost:3000/api/health
```
