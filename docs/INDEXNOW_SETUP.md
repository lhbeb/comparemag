# IndexNow Setup

CompareMag uses IndexNow to notify participating search engines when article URLs are created, updated, imported, or deleted.

## Key File

The verification key is hosted at:

```text
https://comparemag.com/c35fd300ae7045898b8a6654db596b47.txt
```

If production uses `www`, the same file should also be reachable at:

```text
https://www.comparemag.com/c35fd300ae7045898b8a6654db596b47.txt
```

The key file lives in `public/c35fd300ae7045898b8a6654db596b47.txt`.

## Automatic Submissions

The article create, update, import, and delete API routes call `safeSubmitIndexNowUrls()` after the site cache is revalidated.

Only article URLs are submitted automatically:

```text
/blog/{slug}
```

## Manual Submissions

Submit one or more URLs manually with:

```bash
npm run indexnow:submit -- https://comparemag.com/blog/example-slug
```

Submit every published article URL from Supabase with:

```bash
npm run indexnow:submit-all-articles
```

Preview the URLs first with:

```bash
npm run indexnow:submit-all-articles -- --dry-run
```

Use the same host as `NEXT_PUBLIC_SITE_URL`. If the live canonical domain is `https://www.comparemag.com`, set `NEXT_PUBLIC_SITE_URL=https://www.comparemag.com` in production.

## API Route

`POST /api/indexnow/submit` accepts:

```json
{
  "urls": ["https://comparemag.com/blog/example-slug"]
}
```

For safety, this route requires:

```text
Authorization: Bearer {INDEXNOW_SUBMIT_TOKEN}
```

Set `INDEXNOW_SUBMIT_TOKEN` in production before using the endpoint from tools or automations.
