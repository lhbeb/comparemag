# Troubleshooting Guide

## "Failed to fetch" Error

If you're seeing "Failed to fetch" errors when trying to access API routes:

### 1. Restart the Dev Server

After changing `next.config.js`, you **must** restart the dev server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### 2. Clear Next.js Cache

If restarting doesn't work, clear the cache:

```bash
rm -rf .next
npm run dev
```

### 3. Verify API Route is Working

Test the API route directly in your browser:
- Open: `http://localhost:3000/api/articles/list`
- You should see JSON data, not an error

### 4. Check Server Logs

Look at the terminal where `npm run dev` is running. You should see:
- `GET /api/articles/list 200` (success)
- Not `GET /api/articles/list 404` or `500` (error)

### 5. Verify Next.js Config

Make sure `next.config.js` does **NOT** have:
```js
output: "export"  // ❌ This disables API routes
```

It should be removed or commented out.

### 6. Check Network Tab

Open browser DevTools → Network tab:
- Look for the `/api/articles/list` request
- Check if it's returning 200 (success) or an error
- Check the response - it should be JSON, not HTML

## Common Issues

### Issue: API route returns 404
**Solution**: Make sure the file exists at `app/api/articles/list/route.ts`

### Issue: API route returns 500
**Solution**: Check the server logs for the actual error. Usually a database connection issue.

### Issue: CORS errors
**Solution**: API routes in Next.js don't have CORS issues when called from the same origin.

### Issue: "Failed to fetch" in browser console
**Solution**: 
1. Restart dev server
2. Clear `.next` folder
3. Check if the route is accessible at `http://localhost:3000/api/articles/list`

